import Command from '@oclif/command';
import { IConfig } from '@oclif/config';
import { createContainer, asValue, asClass, AwilixContainer, InjectionMode } from 'awilix';
import { AppContainer } from './types';
import Config from './services/config';
import Auth from './services/auth';
import AuthApi from './services/auth-api';
import Api from './services/api';
import Discography from './services/discography';

export default abstract class BaseCommand extends Command {
  app: AwilixContainer;

  constructor(argv: string[], config: IConfig) {
    super(argv, config);

    this.app = createContainer({ injectionMode: InjectionMode.CLASSIC }).register({
      oclifConfig: asValue(config),
      config: asClass(Config).singleton(),
      api: asClass(Api).singleton(),
      authApi: asClass(AuthApi).singleton(),
      auth: asClass(Auth).singleton(),
      discography: asClass(Discography).singleton(),
    });
  }

  resolve<T extends keyof AppContainer>(name: T) {
    return this.app.resolve<AppContainer[T]>(name);
  }
}
