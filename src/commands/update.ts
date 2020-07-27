import { flags } from '@oclif/command';
import cli from 'cli-ux';
import BaseCommand from '../base';

export default class UpdateCommand extends BaseCommand {
  static description = 'update existing discography playlist';

  static examples = [
    `$ spotify-discography update 5oDtp2FC8VqBjTx1aT4P5j 6pyiISrb7yoHw7YDhV7xH8
Updating playlist... done
SHY FX Discography`,
  ];

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  static args = [
    { name: 'artist_id', required: true, description: '[required] Spotify artist ID' },
    { name: 'playlist_id', required: true, description: '[required] Spotify playlist ID' },
  ];

  async run() {
    const [artistId, playlistId] = this.parse(UpdateCommand).argv;

    cli.action.start('Updating playlist');

    const playlist = await this.resolve('discography').update(artistId, playlistId);

    cli.action.stop();
    cli.url(playlist.name, playlist.external_urls.spotify);
  }
}
