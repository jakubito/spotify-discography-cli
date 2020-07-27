import { flags } from '@oclif/command';
import BaseCommand from '../base';

export default class ResetCommand extends BaseCommand {
  static description = 'reset config to default values';

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  async run() {
    this.resolve('config').reset();
  }
}
