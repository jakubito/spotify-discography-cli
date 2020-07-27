import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import { sleep, chunks } from '../helpers';
import { AlbumGroup } from '../enums';
import {
  ConfigInterface,
  ApiInterface,
  Paged,
  GetArtistAlbumsParams,
  AlbumSimplified,
  User,
  CreatePlaylistBody,
  Playlist,
  Artist,
  GetAlbumsParams,
  GetAlbumsResponse,
  TrackSimplified,
  AddTracksToPlaylistBody,
  GetPlaylistParams,
  PlaylistTrack,
} from '../types';

const API_URL = 'https://api.spotify.com/v1';
const FROM_TOKEN = 'from_token';

export default class Api implements ApiInterface {
  constructor(public config: ConfigInterface) {}

  getCurrentUser() {
    return this.get<User>(this.url('me'));
  }

  getArtist(artistId: string) {
    return this.get<Artist>(this.url(`artists/${artistId}`));
  }

  async getArtistAlbums(artistId: string) {
    const url = this.url(`artists/${artistId}/albums`);
    const params: GetArtistAlbumsParams = {
      include_groups: [AlbumGroup.ALBUM, AlbumGroup.SINGLE, AlbumGroup.APPEARS_ON].join(','),
      market: FROM_TOKEN,
      limit: '50',
    };

    const response = await this.get<Paged<AlbumSimplified>>(url, new URLSearchParams(params));

    let next = response.next;

    while (next) {
      const nextResponse = await this.get<Paged<AlbumSimplified>>(next);

      response.items.push(...nextResponse.items);
      next = nextResponse.next;
    }

    return response.items;
  }

  async getAlbumsTracks(albumIds: string[]) {
    const tracks = [];
    const url = this.url('albums');

    for (const albumIdsChunk of chunks(albumIds, 20)) {
      const params: GetAlbumsParams = {
        ids: albumIdsChunk.join(','),
        market: FROM_TOKEN,
      };

      const response = await this.get<GetAlbumsResponse>(url, new URLSearchParams(params));

      for (const album of response.albums) {
        let next = album.tracks.next;

        while (next) {
          const nextResponse = await this.get<Paged<TrackSimplified>>(next);

          album.tracks.items.push(...nextResponse.items);
          next = nextResponse.next;
        }

        tracks.push(album.tracks.items);
      }
    }

    return tracks;
  }

  async getPlaylist(playlistId: string) {
    const url = this.url(`playlists/${playlistId}`);
    const params: GetPlaylistParams = {
      market: FROM_TOKEN,
    };

    const response = await this.get<Playlist>(url, new URLSearchParams(params));

    let next = response.tracks.next;

    while (next) {
      const nextResponse = await this.get<Paged<PlaylistTrack>>(next);

      response.tracks.items.push(...nextResponse.items);
      next = nextResponse.next;
    }

    return response;
  }

  createPlaylist(name: string) {
    const { userId } = this.config.values;
    const url = this.url(`users/${userId}/playlists`);
    const body: CreatePlaylistBody = {
      name,
      public: false,
    };

    return this.post<Playlist>(url, body);
  }

  async addTracksToPlaylist(playlistId: string, trackUris: string[]) {
    const url = this.url(`playlists/${playlistId}/tracks`);
    const step = 100;

    for (const [index, trackUrisChunk] of chunks(trackUris, step).entries()) {
      const body: AddTracksToPlaylistBody = {
        uris: trackUrisChunk,
        position: index * step,
      };

      await this.post<void>(url, body);
    }
  }

  private url(endpoint: string) {
    return `${API_URL}/${endpoint}`;
  }

  private get<T>(url: string, params?: URLSearchParams) {
    return this.api<T>(params ? `${url}?${params}` : url, 'GET');
  }

  private post<T>(url: string, body: object) {
    return this.api<T>(url, 'POST', { 'Content-Type': 'application/json' }, JSON.stringify(body));
  }

  private async api<T>(
    url: string,
    method: string,
    headers: object = {},
    body?: string
  ): Promise<T> {
    const response = await fetch(url, {
      headers: {
        ...headers,
        Authorization: `Bearer ${this.config.values.accessToken}`,
      },
      method,
      body,
    });

    if (response.ok) {
      return response.json();
    }

    // Handle 429 Too many requests
    if (response.status === 429) {
      const waitMs = Number(response.headers.get('Retry-After')) * 1000;

      await sleep(waitMs);

      return this.api(url, method, headers, body);
    }

    if (response.status >= 400 && response.status < 500) {
      const { error } = await response.json();

      throw new Error(`
        API fetch 4XX response
        Status: ${response.status} ${response.statusText}
        Error: ${error.message}
      `);
    }

    throw new Error(`
      API fetch error
      Status: ${response.status} ${response.statusText}
    `);
  }
}
