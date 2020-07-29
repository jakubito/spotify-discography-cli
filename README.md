# Spotify Discography CLI

Create and update Spotify discography playlists.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/spotify-discography-cli.svg)](https://npmjs.org/package/spotify-discography-cli)
[![License](https://img.shields.io/npm/l/spotify-discography-cli.svg)](https://github.com/jakubito/spotify-discography-cli/blob/master/package.json)

<!-- toc -->

- [Spotify Discography CLI](#spotify-discography-cli)
- [Installation](#installation)
- [First-time setup](#first-time-setup)
- [Usage](#usage)
- [Track history](#track-history)
- [Automation](#automation)
- [Commands](#commands)
- [Data storage](#data-storage)
- [Bug reporting](#bug-reporting)
- [License](#license)
<!-- tocstop -->

# Installation

## NPM / Yarn

```
npm install -g spotify-discography-cli
```

or

```
yarn global add spotify-discography-cli
```

## Standalone tarballs

You can download standalone tarballs from [Releases](https://github.com/jakubito/spotify-discography-cli/releases) section. These include the node binary so you don't have to have Node / NPM / Yarn installed.

# First-time setup

In order to use this app, you have to provide a Spotify app's client ID and secret. To obtain these, you have to create a new app within Spotify dashboard:

1. Log in to [Spotify Dashboard](https://developer.spotify.com/dashboard/) with your account.
2. Click on **Create an app** and provide title and description of your choice (e.g. _Spotify Discography CLI_)
3. Check both checkboxes and click on **Create**
4. On the app page, click on **Edit Settings**
5. Add `http://localhost:10101` to your **Redirect URIs** field and click "Save"
6. You should see your app's client ID and secret in top left

Once you have client ID and secret, run

```
spotify-discography init
```

You will be asked for client ID and secret followed by authorization with Spotify. Once authorized, you should see a success message.

That's it! You can now start using the app.

# Usage

## Create a new discography

To create a new discography playlist for specific artist, you have to get that artist's ID first. There are many ways to get an artist's ID. The easiest one is to go to an artist's page in the web player and check the url - the ID is highlighted in bold: &#8203;https//open.spotify.com/artist/**5oDtp2FC8VqBjTx1aT4P5j**

Once you have artist ID, run

```
spotify-discography create ARTIST_ID
```

for example

```
spotify-discography create 5oDtp2FC8VqBjTx1aT4P5j
```

This will create a new discography private playlist and display hyperlink in supported terminals.

## Update an existing discography

It is possible to update an existing playlist with new releases. In this case, you have to provide **both** artist and playlist IDs. The process of getting a playlist's ID is the same as it is for an artist - open a playlist in web player and check the url.

Once you have both artist and playlist IDs, run

```
spotify-discography update ARTIST_ID PLAYLIST_ID
```

for example

```
spotify-discography update 5oDtp2FC8VqBjTx1aT4P5j 6pyiISrb7yoHw7YDhV7xH8
```

# Track history

Each time you create or update a playlist, the information about tracks added is saved on disk. On each update, this data is loaded and checked against. In other words, if you delete a track from a playlist, it won't be added again on next update.

You can override this behaviour using `--force` flag when updating a playlist. This will ignore track history and force add all missing tracks.

# Automation

To automate playlist updates, the easiest way is to set up a cron job. The following example updates the playlist with new releases once a day:

```
0 0 * * * /Users/jakubito/Documents/spotify-discography/bin/spotify-discography update 2CIMQHirSU0MQqyYHq0eOx 3igxuZDwGlXocuh9b2T14D
```

# Commands

<!-- commands -->

- [`spotify-discography config [CONFIG_KEY] [CONFIG_VALUE]`](#spotify-discography-config-config_key-config_value)
- [`spotify-discography create ARTIST_ID`](#spotify-discography-create-artist_id)
- [`spotify-discography help [COMMAND]`](#spotify-discography-help-command)
- [`spotify-discography init`](#spotify-discography-init)
- [`spotify-discography reset`](#spotify-discography-reset)
- [`spotify-discography update ARTIST_ID PLAYLIST_ID`](#spotify-discography-update-artist_id-playlist_id)

## `spotify-discography config [CONFIG_KEY] [CONFIG_VALUE]`

display / update config

```
USAGE
  $ spotify-discography config [CONFIG_KEY] [CONFIG_VALUE]

ARGUMENTS
  CONFIG_KEY    [optional] config key - one of "authServerPort", "userId", "clientId", "clientSecret", "accessToken",
                "refreshToken", "tokenExpiration"

  CONFIG_VALUE  [optional] config value to save

OPTIONS
  -h, --help  show CLI help

EXAMPLES
  $ spotify-discography config clientId 9d08c83130e2933e6a440541371fb458

  $ spotify-discography config clientId
  9d08c83130e2933e6a440541371fb458

  $ spotify-discography config
  authServerPort: 10101
  clientId:       9d08c83130e2933e6a440541371fb458
```

_See code: [src/commands/config.ts](https://github.com/jakubito/spotify-discography-cli/blob/v1.0.2/src/commands/config.ts)_

## `spotify-discography create ARTIST_ID`

create new discography playlist

```
USAGE
  $ spotify-discography create ARTIST_ID

ARGUMENTS
  ARTIST_ID  [required] Spotify artist ID

OPTIONS
  -h, --help  show CLI help

EXAMPLE
  $ spotify-discography create 5oDtp2FC8VqBjTx1aT4P5j
  Creating new playlist... done
  SHY FX Discography
```

_See code: [src/commands/create.ts](https://github.com/jakubito/spotify-discography-cli/blob/v1.0.2/src/commands/create.ts)_

## `spotify-discography help [COMMAND]`

display help for spotify-discography

```
USAGE
  $ spotify-discography help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.1.0/src/commands/help.ts)_

## `spotify-discography init`

initialize config and authorize with Spotify

```
USAGE
  $ spotify-discography init

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/init.ts](https://github.com/jakubito/spotify-discography-cli/blob/v1.0.2/src/commands/init.ts)_

## `spotify-discography reset`

reset config to default values

```
USAGE
  $ spotify-discography reset

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/reset.ts](https://github.com/jakubito/spotify-discography-cli/blob/v1.0.2/src/commands/reset.ts)_

## `spotify-discography update ARTIST_ID PLAYLIST_ID`

update existing discography playlist

```
USAGE
  $ spotify-discography update ARTIST_ID PLAYLIST_ID

ARGUMENTS
  ARTIST_ID    [required] Spotify artist ID
  PLAYLIST_ID  [required] Spotify playlist ID

OPTIONS
  -f, --force  ignore history and force add all missing tracks
  -h, --help   show CLI help

EXAMPLE
  $ spotify-discography update 5oDtp2FC8VqBjTx1aT4P5j 6pyiISrb7yoHw7YDhV7xH8
  Updating playlist... done
  SHY FX Discography
```

_See code: [src/commands/update.ts](https://github.com/jakubito/spotify-discography-cli/blob/v1.0.2/src/commands/update.ts)_

<!-- commandsstop -->

# Data storage

All application data is stored locally on your computer:

- Unix: `~/.config/spotify-discography-cli`
- Windows: `%LOCALAPPDATA%\spotify-discography-cli`

# Bug reporting

If you find a bug, please send me an e-mail to dobes.jakub@gmail.com or open an issue here on github.

# License

ISC
