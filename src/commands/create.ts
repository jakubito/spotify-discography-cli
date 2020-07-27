import { flags } from '@oclif/command';
import cli from 'cli-ux';
import BaseCommand from '../base';

export default class CreateCommand extends BaseCommand {
  static description = 'create new discography playlist';

  static examples = [
    `$ spotify-discography create 5oDtp2FC8VqBjTx1aT4P5j
Creating new playlist... done
SHY FX Discography`,
  ];

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  static args = [
    { name: 'artist_id', required: true, description: '[required] Spotify artist ID' },
  ];

  async run() {
    const [artistId] = this.parse(CreateCommand).argv;

    cli.action.start('Creating new playlist');

    const playlist = await this.resolve('discography').create(artistId);

    cli.action.stop();
    cli.url(playlist.name, playlist.external_urls.spotify);
  }
}
