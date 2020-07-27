import { flags } from '@oclif/command';
import cli from 'cli-ux';
import BaseCommand from '../base';

export default class InitCommand extends BaseCommand {
  static description = 'run config initialization process';

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  async run() {
    const clientId = await cli.prompt('Client ID', { required: true });
    const clientSecret = await cli.prompt('Client Secret', { required: true });

    this.resolve('config').set({ clientId, clientSecret });
  }
}
