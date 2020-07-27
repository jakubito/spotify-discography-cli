import { createServer } from 'http';
import { URLSearchParams } from 'url';
import { parseUrl } from 'query-string';
import cli from 'cli-ux';
import { Socket } from 'net';
import { Scope, ServerResponse } from '../enums';
import {
  ConfigInterface,
  AuthInterface,
  AuthApiInterface,
  AuthorizeParams,
  AuthorizeResponse,
  ApiInterface,
} from '../types';

const AUTH_URL = 'https://accounts.spotify.com/authorize';

export default class Auth implements AuthInterface {
  constructor(
    public config: ConfigInterface,
    public authApi: AuthApiInterface,
    public api: ApiInterface
  ) {}

  async trigger() {
    const { clientId, clientSecret } = this.config.values;

    if (!clientId || !clientSecret) {
      throw new Error('Invalid client ID / secret');
    }

    const authCode = await this.listen();
    const tokenData = await this.authApi.exchange(authCode);

    this.config.set(tokenData);

    const user = await this.api.getCurrentUser();

    this.config.set('userId', user.id);
  }

  async ensureToken() {
    const { userId, accessToken, tokenExpiration, refreshToken } = this.config.values;

    if (!userId || !accessToken || !tokenExpiration || !refreshToken) {
      throw new Error('Not authorized');
    }

    if (new Date() > new Date(tokenExpiration as string)) {
      const tokenData = await this.authApi.refresh();

      this.config.set(tokenData);
    }
  }

  private listen() {
    const { authServerPort, clientId } = this.config.values;
    const sockets = new Set<Socket>();

    const authParams: AuthorizeParams = {
      client_id: clientId as string,
      response_type: 'code',
      redirect_uri: `http://localhost:${authServerPort}`,
      scope: [Scope.PLAYLIST_MODIFY_PRIVATE, Scope.PLAYLIST_MODIFY_PUBLIC].join(' '),
    };

    return new Promise<string>((resolve, reject) => {
      const server = createServer((request, response) => {
        const { query }: { query: AuthorizeResponse } = parseUrl(request.url as string);

        response.on('finish', () => {
          for (const socket of sockets) {
            socket.destroy();
          }

          server.close(() => {
            query.code ? resolve(query.code) : reject(new Error(query.error));
          });
        });

        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.end(query.code ? ServerResponse.AUTH_SUCCESS : ServerResponse.AUTH_ERROR);
      })
        .on('connection', (socket) => {
          sockets.add(socket);
        })
        .on('error', reject)
        .listen({
          port: authServerPort,
          host: 'localhost',
        });

      cli.open(`${AUTH_URL}?${new URLSearchParams(authParams)}`);
    });
  }
}
