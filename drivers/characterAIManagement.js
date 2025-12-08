require('dotenv').config();
const language = process.env.LANGUAGE;
const dictionary = require('../config/dictionary.json');

const { AttachmentBuilder } = require('discord.js');

let client = null;
let clientVoice = null;

async function createConnection() {

    try {
        client = new (await (import('cainode'))).CAINode();
        await client.login(process.env.CHARACTERAI_TOKEN);

        const character = await client.character.connect(process.env.CHARACTERAI_ID);
        await setCharacterInfo(character);
        return "OK";

    } catch (err) {
        console.error(err);
        return "FAIL"
    }
};

async function createAIVoiceConnection() {
    try {
        console.log('Importing client...');
        client = new (await (import('cainode'))).CAINode();
        console.log('Logging in...');
        await client.login(process.env.CHARACTERAI_TOKEN);
        console.log('Connecting client...');
        const character = await client.character.connect(process.env.CHARACTERAI_ID);
        console.log('Setting up characterInfo...');
        await setCharacterInfo(character);
        console.log('Connecting voice...');
        if(process.env.CHARACTERAI_VOICENAME){
            clientVoice = await client.voice.connect(process.env.CHARACTERAI_VOICENAME, true, true);
        }
        clientVoice = await client.voice.connect(characterInfo.default_voice_id, false, true);
        global.isVoiceChat = true;
    } catch (err) {
        console.error(err);
    }
};

async function endConnection() {
    if (global.isVoiceChat == true) {
        await clientVoice.disconnect();
        clientVoice = null;
    }

    await client.character.disconnect();
    await client.logout();

    client = null;
    characterInfo = null;
    global.isVoiceChat = false;
};

async function getReply(interaction, message) {
    try {
        const response = await client.character.send_message(`${process.env.ADD_NICKNAME_TO_PROMPT == 'true' ? interaction.mentions.repliedUser.globalName + ':' : ''} ${new RegExp('<@.*_?>').test(message.content) == true ? message.content.replace(/<@.*_?>/g, '') : message.content}`);

        if (response.turn.state == 'STATE_OK') {
            switch (global.messageMode) {
                case 'text':
                    const rawMessage = response.turn.candidates[0].raw_content;
                    await interaction.edit(await rawMessage.substring(rawMessage.indexOf(':') + 1, rawMessage.length));
                    break;
                case 'tts':
                    await replyWithAudio(interaction,response);
                    break;
                default:
                    await interaction.edit(dictionary[language].interactions.errors.unexpectedError);
                    throw new Error('global.messageMode not specified or invalid value');
            }


        } else {
            await interaction.edit(dictionary[language].interactions.errors.contactAPIError);
            console.log(response);
        }
    } catch (err) {
        await interaction.edit(dictionary[language].interactions.errors.unexpectedError);
        console.log(err);
    }
};

async function replyWithAudio(interaction,response){
    const ttsUrl = await JSON.parse(
    JSON.stringify(
        await client.character.replay_tts(
        response.turn.turn_key.turn_id,
        response.turn.candidates[0].candidate_id,
        process.env.CHARACTERAI_VOICENAME ?? characterInfo.default_voice_id,
        process.env.CHARACTERAI_VOICENAME ? true : false
    ))).replayUrl;

    const res = await fetch(ttsUrl);

    if (!res.ok) {
        await interaction.edit(dictionary[language].interactions.errors.unexpectedError);
        console.error(`Failed to fetch MP3: ${res.status} ${res.statusText}`);
    }

    const buffer = await res.arrayBuffer();

    const file = new AttachmentBuilder(Buffer.from(buffer), { name: 'audio.mp3' });

    await interaction.edit({files: [file]});
}

function getAIVoiceConnection() {
    return clientVoice;
};

function getClient() {
    return client;
}

async function setCharacterInfo(character) {
    try {
        const character = await client.character.info(process.env.CHARACTERAI_ID);
        const characterInfoString = JSON.stringify(character.character);
        characterInfo = await JSON.parse(characterInfoString)
    } catch (error) {
        console.warn(`An error occurred while fetching character info: ${error}`);
        if(await error.message?.includes("Unexpected token")){
            console.warn("This is likely due to a CAINode JSON parsing issue. Assigning the character object instead.");
            characterInfo = character.chats[0];
        }
    }

}

module.exports = { createConnection, createAIVoiceConnection, endConnection, getReply, getAIVoiceConnection, getClient };