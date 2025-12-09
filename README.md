<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
<h3 align="center">characterai-bot-discordjs</h3>

  <p align="center">
    A Discord bot that integrates with Character AI to enable interactive voice and text conversations in Discord voice channels.
    <br />
    <a href="https://github.com/EmRodDev/characterai-bot-discordjs/issues/new?labels=bug">Report Bug</a>
    &middot;
    <a href="https://github.com/EmRodDev/characterai-bot-discordjs/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#commands">Commands</a></li>
    <li><a href="#project-structure">Project Structure</a></li>
    <li><a href="#troubleshooting">Troubleshooting</a></li>
    <li><a href="#contributing">Contributing</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

A Discord bot that integrates with Character AI to enable interactive voice and text conversations in Discord voice channels. The bot can join voice chats, respond using Character AI, and support both text and TTS (text-to-speech) modes.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* [Node.js](https://nodejs.org/en)
* [Discord.js](https://discord.js.org/)
* [CAINode](https://github.com/KevinAdhaikal/CAINode)
* [Docker](https://www.docker.com/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these steps.

### Prerequisites

- Node.js 20+
- Discord bot token and application client ID (create at [Discord Developer Portal](https://discord.com/developers/applications)).
- Character AI account and token (for API access).

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/EmRodDev/characterai-bot-discordjs.git
   cd characterai-bot-discordjs
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`:
     ```
     cp .env.example .env
     ```
   - Edit `.env` with your values:
     ```
     BOT_TOKEN=your_discord_bot_token
     CLIENT_ID=your_discord_application_id
     LANGUAGE=en_US  # e.g., en_US, es_ES
     CHARACTERAI_ID=your_character_ai_character_id
     CHARACTERAI_TOKEN=your_character_ai_token
     CHARACTERAI_VOICENAME=your_tts_voice_name  # e.g., Sonic the Hedgehog. You can remove this variable if the bot is not getting the correct voice.
     ADD_NICKNAME_TO_PROMPT=true  # Add user nickname to AI prompts
     ```

4. Start the bot:
   ```
   npm start
   ```

The bot will log in to Discord and register slash commands.

#### Deployment with Docker

This project includes Docker support for containerized deployment.

1. Ensure Docker and Docker Compose are installed.

2. Configure `.env` as described in Local Setup.

3. Build and run the container:
   ```
   docker-compose up -d
   ```

- The bot runs in a Node 20 container with all dependencies installed.
- It uses the `.env` file for configuration.
- Auto-restarts on failure.

To stop:
```
docker-compose down
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Commands

All commands are slash commands (`/command`) and support the configured language.

- **/join (WIP)**
  - Description: Makes the bot join your current voice channel and starts listening and speaking to a user.
  - Requirements: You must be in a voice channel.
  - Behavior: 
    - Currently, it can only listen to one person at a time, and stops speaking if the user doesn't interact with it for a while (two minutes approximately).
    - Interaction through text channel is disabled while on this mode until it leaves. 

- **/leave**
  - Description: Makes the bot leave the voice channel and stop the interaction.
  - Behavior: Stops playback, disconnects, and restarts the bot for clean state.

- **/mode**
  - Description: Switches the interaction mode.
  - Options:
    - `text`: Text-only responses (no voice).
    - `tts`: Text-to-speech mode for voice responses.
  - Default: Starts in text mode.

- **/test**
  - Description: Simple test command to verify the bot is working.
  - Response: Greets the user in the configured language.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



## Project Structure

- `index.js`: Bot entry point.
- `commands/utility/`: Slash command implementations.
- `drivers/`: Core logic for Character AI (`characterAIManagement.js`), voice (`voiceConnection.js`), and utils.
- `events/`: Discord event handlers (ready, interactions, voice updates).
- `config/dictionary.json`: Multi-language strings.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Troubleshooting

- Ensure bot has permissions: `Connect`, `Speak`, `Use Slash Commands` in voice channels.
- If voice connection fails, check opus/audio dependencies.
- For Character AI issues, verify token and ID.
- Logs: Check console output for errors.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contributing

Fork the repo, make changes, and submit a PR. See GitHub for issues.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
