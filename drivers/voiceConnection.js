require('dotenv').config();
const { joinVoiceChannel, createAudioResource, createAudioPlayer, StreamType, AudioPlayerStatus } = require('@discordjs/voice');
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

function startCharacterAudioPlayback(interaction) {

    voiceConnection = joinVoiceChannel({
        channelId: interaction.member.voice.channelId,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
        selfDeaf: false
    });

    receiver = voiceConnection.receiver;
    aiVoice = getAIVoiceConnection();

    // Prepare live stream
    liveStream = new Readable({
        read() { }
    });


    setUpVoiceChatSpeaker();
    captureAndHandleVoices();
    getAIResponse();

    console.log('Successfully joined voice chat');

}

function setUpVoiceChatSpeaker() {
    // Create and configure player
    player = createAudioPlayer();
    const resource = createAudioResource(liveStream, {
        inputType: StreamType.Raw,
    });

    player.play(resource);
    voiceConnection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
        console.log('[Voice] Audio player idle.');
    });

    player.on('error', error => {
        console.error('[Voice] Player error:', error);
    });

    console.log('Successfully set up speaker');

}



function captureAndHandleVoices() {

    receiver.speaking.on('start', (userId) => {
        if (userId === voiceConnection.joinConfig.selfDeaf) return;
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
            aiVoice.input_write(pcmChunk);

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
    aiVoice.on("frameReceived", ev => {
        const rawFrame = Buffer.from(ev.value.data.buffer);
        const fixedFrame = upsampleFrame(rawFrame)
        if (liveStream != null) liveStream.push(fixedFrame);
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
        aiVoice = null;
    }

    await endConnection();
    liveStream = null;
    senderSpeaking = false;

    console.log('Left the voice chat');

}

module.exports = { startCharacterAudioPlayback, stopCharacterAudioPlayback, captureAndHandleVoices }