require('dotenv').config();
const language = process.env.LANGUAGE;
const dictionary = require('../config/dictionary.json');

let client = null;
let clientVoice = null;
let characterInfo = null;

async function createConnection() {

    try {
        client = new(await (import('cainode'))).CAINode();
        await client.login(process.env.CHARACTERAI_TOKEN);
        await client.character.connect(process.env.CHARACTERAI_ID);
        await setCharacterInfo();
        console.log(characterInfo.default_voice_id);
        return "OK";

    } catch (err) {
        console.log(err);
        return "FAIL"
    }
};

async function createAIVoiceConnection() {
    try {
        client = new(await (import('cainode'))).CAINode();
        await client.login(process.env.CHARACTERAI_TOKEN);
        await client.character.connect(process.env.CHARACTERAI_ID);
        await setCharacterInfo();

        clientVoice = await client.voice.connect(process.env.CHARACTERAI_VOICENAME, true, true);
    } catch (err) {
        console.log(err);
    }
};

async function endConnection() {
    if(global.isVoiceChat) await clientVoice.disconnect();
    await client.character.disconnect();
    await client.logout();

    client = null;
};

async function getReply(interaction, message) {
    try {
        const response = await client.character.send_message(message.content);

        if (response.turn.state == 'STATE_OK') {
            const rawMessage = response.turn.candidates[0].raw_content;
            await interaction.edit(await rawMessage.substring(rawMessage.indexOf(':') + 1, rawMessage.length));

        } else {
            await interaction.edit(dictionary[language].interactions.errors.contactAPIError);
            console.log(response);
        }
    } catch (err) {
        await interaction.edit(dictionary[language].interactions.errors.unexpectedError);
        console.log(err);
    }
};

async function getAiAudioReply(text) {
    try {
        const response = await client.character.send_message(text);

        if (response.turn.state == 'STATE_OK') {

            const tts = await client.character.replay_tts(
                response.turn.turn_key.turn_id,
                response.turn.candidates[0].candidate_id,
                characterInfo.default_voice_id
            ); 

            return tts.replayUrl;
            
        } else {
            console.error(response);
        }
    } catch (err) {
        console.error(err);
    }
}

function getAIVoiceConnection() {
    return clientVoice;
};

function getClient() {
    return client;
}

async function setCharacterInfo() {
    const character = await client.character.info(process.env.CHARACTERAI_ID);
    const characterInfoString = JSON.stringify(character.character);
    characterInfo = await JSON.parse(characterInfoString)
}

module.exports = { createConnection, createAIVoiceConnection, endConnection, getReply, getAIVoiceConnection, getClient, getAiAudioReply };