import { flags } from '@oclif/command';
import cli from 'cli-ux';
import BaseCommand from '../base';
import { isNumeric, isValidConfigKey } from '../helpers';
import { CONFIG_KEYS } from '../enums';

const validKeys = CONFIG_KEYS.map((key) => `"${key}"`).join(', ');

export default class ConfigCommand extends BaseCommand {
  static description = 'display / update config';

  static examples = [
    `$ spotify-discography config clientId 9d08c83130e2933e6a440541371fb458
`,
    `$ spotify-discography config clientId
9d08c83130e2933e6a440541371fb458
`,
    `$ spotify-discography config
authServerPort: 10101
clientId:       9d08c83130e2933e6a440541371fb458`,
  ];

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  static args = [
    {
      name: 'config_key',
      required: false,
      description: `[optional] config key - one of ${validKeys}`,
    },
    {
      name: 'config_value',
      required: false,
      description: '[optional] config value to save',
    },
  ];

  async run() {
    const [key, value] = this.parse(ConfigCommand).argv;
    const config = this.resolve('config');

    if (!key) {
      return cli.styledObject(config.values);
    }

    if (!isValidConfigKey(key)) {
      this.error(`Invalid config property: "${key}". Valid properties: ${validKeys}`);
    }

    if (!value) {
      return cli.log(config.values[key]?.toString());
    }

    config.set(key, this.parseInput(value));
  }

  private parseInput(value: string) {
    if (value === 'true') {
      return true;
    }

    if (value === 'false') {
      return false;
    }

    if (isNumeric(value)) {
      return Number(value);
    }

    return value;
  }
}
