import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import { getTokenExpiration } from '../helpers';
import {
  AuthApiInterface,
  ConfigInterface,
  ExchangeAuthCodeResponse,
  RefreshTokenRequest,
  ExchangeAuthCodeRequest,
  RefreshTokenResponse,
  ExchangeAuthCodeResult,
  RefreshTokenResult,
} from '../types';

const AUTH_API_URL = 'https://accounts.spotify.com/api/token';

export default class AuthApi implements AuthApiInterface {
  constructor(public config: ConfigInterface) {}

  async exchange(code: string): Promise<ExchangeAuthCodeResult> {
    const { authServerPort } = this.config.values;

    const response = await this.callApi({
      grant_type: 'authorization_code',
      redirect_uri: `http://localhost:${authServerPort}`,
      code,
    });

    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      tokenExpiration: getTokenExpiration(response.expires_in),
    };
  }

  async refresh(): Promise<RefreshTokenResult> {
    const { refreshToken } = this.config.values;

    const response = await this.callApi({
      grant_type: 'refresh_token',
      refresh_token: refreshToken as string,
    });

    return {
      accessToken: response.access_token,
      tokenExpiration: getTokenExpiration(response.expires_in),
    };
  }

  private async callApi(body: ExchangeAuthCodeRequest): Promise<ExchangeAuthCodeResponse>;
  private async callApi(body: RefreshTokenRequest): Promise<RefreshTokenResponse>;
  private async callApi(body: ExchangeAuthCodeRequest | RefreshTokenRequest) {
    const { clientId, clientSecret } = this.config.values;
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch(AUTH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams(body),
    });

    if (response.ok) {
      return response.json();
    }

    if (response.status === 400) {
      const { error, error_description } = await response.json();

      throw new Error(`
        Auth API fetch error response
        Status: ${response.status} ${response.statusText}
        Error: ${error} ${error_description}
      `);
    }

    throw new Error(`
      Auth API fetch error
      Status: ${response.status} ${response.statusText}
    `);
  }
}
