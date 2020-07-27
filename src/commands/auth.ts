import { flags } from '@oclif/command';
import cli from 'cli-ux';
import BaseCommand from '../base';

export default class AuthCommand extends BaseCommand {
  static description = 'authorize with Spotify';

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  async run() {
    cli.action.start('Authorization started');

    await this.resolve('auth').trigger();

    cli.action.stop();
  }
}
