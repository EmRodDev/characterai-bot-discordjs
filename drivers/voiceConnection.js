require('dotenv').config();
const { joinVoiceChannel, createAudioResource, createAudioPlayer, entersState, NoSubscriberBehavior, StreamType, AudioPlayerStatus, VoiceConnectionStatus} = require('@discordjs/voice');
const prism = require('prism-media');
const { Readable } = require('stream');

const { getAIVoiceConnection, endConnection } = require('./characterAIManagement');
const { upsampleFrame } = require('./utils');

// Internal state
let liveStream = null;
let player = null;
let voiceConnection = null;
let receiver = null;
let senderSpeaking = false;
let aiVoice = null;
let botUserId = null;
let inputWriteChain = Promise.resolve();
let inputFrameCount = 0;
let outputFrameCount = 0;

async function startCharacterAudioPlayback(interaction) {

    voiceConnection = joinVoiceChannel({
        channelId: interaction.member.voice.channelId,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
        selfDeaf: false,
        debug: true
    });
    voiceConnection.on('error', error => console.error('[Voice] Discord connection error:', error));
    voiceConnection.on('debug', message => {
        // Voice identify packets include credentials; do not print them.
        if (message.includes('"token"')) {
            console.log('[Voice] Discord transport: authentication packet sent.');
            return;
        }
        console.log(`[Voice] Discord transport: ${message}`);
    });
    voiceConnection.on('stateChange', (oldState, newState) => {
        console.log(`[Voice] Discord connection: ${oldState.status} -> ${newState.status}`);
    });

    aiVoice = getAIVoiceConnection();
    botUserId = interaction.client.user.id;
    if (!aiVoice) {
        voiceConnection.destroy();
        voiceConnection = null;
        throw new Error('Character.AI voice connection is not available');
    }

    await waitForVoiceConnection();
    checkVoiceConnectionChange();
    receiver = voiceConnection.receiver;
    liveStream = new Readable({
        read() { }
    });

    setUpVoiceChatSpeaker();
    captureAndHandleVoices();
    checkVoiceConnectionChange();
    getAIResponse();

    console.log('Successfully joined voice chat and subscribed to Character.AI audio');

}

async function waitForVoiceConnection() {
    try {
        await entersState(voiceConnection, VoiceConnectionStatus.Ready, 20_000);
    } catch (error) {
        console.warn('[Voice] Discord voice connection was not ready after 20 seconds; retrying once.');
        voiceConnection.rejoin();
        await entersState(voiceConnection, VoiceConnectionStatus.Ready, 20_000);
    }
}

function checkVoiceConnectionChange() {
    voiceConnection.on('stateChange', async (oldState, newState) => {
        if (newState.status === VoiceConnectionStatus.Disconnected) {
            await stopCharacterAudioPlayback();
            global.isVoiceChat = false;
        }
    });
}

function setUpVoiceChatSpeaker() {
    // Create and configure player
    player = createAudioPlayer({
        behaviors: { noSubscriber: NoSubscriberBehavior.Play }
    });
    const resource = createAudioResource(liveStream, {
        inputType: StreamType.Raw,
    });

    player.play(resource);
    voiceConnection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
        console.log('[Voice] Audio player idle.');
    });

    player.on(AudioPlayerStatus.Playing, () => {
        console.log('[Voice] Discord audio player is playing.');
    });

    player.on('error', error => {
        console.error('[Voice] Player error:', error);
    });

    console.log('Successfully set up speaker');

}



function captureAndHandleVoices() {

    receiver.speaking.on('start', (userId) => {
        // Do not send the bot's own playback back to Character.AI.
        if (userId === botUserId) return;
        if (senderSpeaking) return;

        senderSpeaking = true;
        console.log(`Started listening to ${userId}`)

        const audioStream = receiver.subscribe(userId, {
            end: {
                behavior: 'manual'
            }
        });

        const decoder = new prism.opus.Decoder({
            rate: 48000,        // Discord's Opus stream is 48kHz
            channels: 1,        // Stereo
            frameSize: 960,     // 20ms frame
        });

        const pcmStream = audioStream.pipe(decoder);

        pcmStream.on('data', (pcmChunk) => {
            // LiveKit's captureFrame is asynchronous. Serialize writes so a stream of
            // Discord packets cannot overrun the Character.AI audio source.
            inputWriteChain = inputWriteChain
                .then(async () => {
                    if (!aiVoice) return;
                    await aiVoice.input_write(pcmChunk);
                    inputFrameCount++;
                    if (inputFrameCount === 1) {
                        console.log(`[Voice] Sent PCM to Character.AI (${pcmChunk.length} bytes per frame).`);
                    }
                })
                .catch(error => console.error('[Voice] Failed to send PCM to Character.AI:', error));

            //Workaround to handle voice recording stops
            clearTimeout(audioStream._timeout);
            audioStream._timeout = setTimeout(() => {
                audioStream.destroy();
                console.log(`Finished listening to ${userId}`);
                senderSpeaking = false;
            }, 1000);
        });

        audioStream.on('error', console.error);
    });
}

function getAIResponse() {
    aiVoice.on('dataReceived', data => {
        if (data?.event === 'speechStarted' || data?.event === 'speechEnded') {
            console.log(`[Voice] Character.AI ${data.event}.`);
        }
    });

    aiVoice.on("frameReceived", ev => {
        // `AudioStream.next()` returns { done: true } when the remote track closes.
        // AudioFrame.data is a typed-array view, so preserve its offset and length rather
        // than writing its entire backing ArrayBuffer to Discord.
        if (!ev || ev.done || !ev.value?.data || !liveStream) return;

        const data = ev.value.data;
        const rawFrame = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
        if (rawFrame.length === 0) return;

        const sampleRate = ev.value.sampleRate ?? ev.value.sample_rate ?? 48_000;
        const channels = ev.value.channels ?? ev.value.numChannels ?? 1;
        // @discordjs/voice encodes raw PCM as 48 kHz stereo. LiveKit supplies
        // mono frames, which must be expanded to left/right sample pairs.
        const frame = channels === 1 ? upsampleFrame(rawFrame) : rawFrame;
        liveStream.push(frame);
        outputFrameCount++;
        if (outputFrameCount === 1) {
            console.log(`[Voice] Received Character.AI PCM (${rawFrame.length} bytes, ${sampleRate} Hz, ${channels} channel).`);
        }

    });
}



// Call this when bot leaves VC or to stop audio
async function stopCharacterAudioPlayback() {
    if (player) {
        await player.stop();
        player = null;
    }

    if (voiceConnection) {
        await voiceConnection.destroy();
        voiceConnection = null;
    }

    if (receiver) {
        await receiver.speaking.removeAllListeners('start');
        receiver = null;
    }

    if (aiVoice) {
        await aiVoice.removeAllListeners('frameReceived');
        await aiVoice.removeAllListeners('dataReceived');
        aiVoice = null;
    }

    await endConnection();
    liveStream = null;
    senderSpeaking = false;
    botUserId = null;
    inputWriteChain = Promise.resolve();
    inputFrameCount = 0;
    outputFrameCount = 0;

    console.log('Left the voice chat');

}

module.exports = { startCharacterAudioPlayback, stopCharacterAudioPlayback, captureAndHandleVoices }
