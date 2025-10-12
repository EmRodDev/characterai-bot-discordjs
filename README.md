# Character AI Discord Bot

A Discord bot that integrates with Character AI to enable interactive voice and text conversations in Discord voice channels. The bot can join voice chats, respond using Character AI, and support both text and TTS (text-to-speech) modes.

## Features

- Join/leave voice channels with AI interaction.
- Switch between text and TTS modes.
- Multi-language support via dictionary config.
- Docker deployment for easy setup.

## Prerequisites

- Node.js 20+
- Discord bot token and application client ID (create at [Discord Developer Portal](https://discord.com/developers/applications)).
- Character AI account and token (for API access).

## Local Setup

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
     CHARACTERAI_VOICENAME=your_tts_voice_name  # e.g., Sonic the Hedgehog
     ADD_NICKNAME_TO_PROMPT=true  # Add user nickname to AI prompts
     ```

4. Start the bot:
   ```
   npm start
   ```

The bot will log in to Discord and register slash commands.

## Deployment with Docker

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

## Available Commands

All commands are slash commands (`/command`) and support the configured language.

- **/join**
  - Description: Makes the bot join your current voice channel and start Character AI interaction.
  - Requirements: You must be in a voice channel.
  - Behavior: If not already in voice, connects and starts audio/text playback based on mode.

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

## Configuration

- **Language**: Set `LANGUAGE` in `.env` (e.g., `en_US`). Dictionary translations are in `config/dictionary.json`.
- **Character AI**: Customize the character and voice via `CHARACTERAI_ID`, `CHARACTERAI_TOKEN`, and `CHARACTERAI_VOICENAME`.
- **Prompts**: `ADD_NICKNAME_TO_PROMPT` includes user nicknames in AI prompts for personalized responses.

## Project Structure

- `index.js`: Bot entry point.
- `commands/utility/`: Slash command implementations.
- `drivers/`: Core logic for Character AI (`characterAIManagement.js`), voice (`voiceConnection.js`), and utils.
- `events/`: Discord event handlers (ready, interactions, voice updates).
- `config/dictionary.json`: Multi-language strings.

## Troubleshooting

- Ensure bot has permissions: `Connect`, `Speak`, `Use Slash Commands` in voice channels.
- If voice connection fails, check opus/audio dependencies.
- For Character AI issues, verify token and ID.
- Logs: Check console output for errors.

## Contributing

Fork the repo, make changes, and submit a PR. See GitHub for issues.

## License

[MIT License](LICENSE) (assuming standard; check repo).
