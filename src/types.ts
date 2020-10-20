import { CONFIG_KEYS, AlbumGroup } from './enums'
import { IConfig } from '@oclif/config'

/**
 * App container and services
 */

export interface AppContainer {
  oclifConfig: IConfig
  config: ConfigInterface
  api: ApiInterface
  authApi: AuthApiInterface
  auth: AuthInterface
  discography: DiscographyInterface
  history: HistoryInterface
}

export interface ConfigInterface {
  values: ConfigValues
  set(key: ConfigKey, value: ConfigValue): void
  set(values: ConfigValues): void
  reset(): void
}

export interface AuthInterface {
  trigger(): Promise<void>
  ensureToken(): Promise<void>
}

export interface AuthApiInterface {
  exchange(code: string): Promise<ExchangeAuthCodeResult>
  refresh(): Promise<RefreshTokenResult>
}

export interface ApiInterface {
  getCurrentUser(): Promise<User>
  getArtist(artistId: string): Promise<Artist>
  getArtistAlbums(artistId: string): Promise<AlbumSimplified[]>
  getAlbumsTracks(albumIds: string[]): Promise<TrackSimplified[][]>
  getPlaylist(playlistId: string): Promise<Playlist>
  createPlaylist(name: string): Promise<Playlist>
  addTracksToPlaylist(playlistId: string, trackUris: string[]): Promise<void>
}

export interface DiscographyInterface {
  create(artistId: string): Promise<Playlist>
  update(artistId: string, playlistId: string, force?: boolean): Promise<Playlist>
}

export interface HistoryInterface {
  load(artistId: string, playlistId: string): string[]
  save(artistId: string, playlistId: string, trackIds: string[]): void
}

/**
 * Config
 */

export type ConfigKey = typeof CONFIG_KEYS[number]

export type ConfigValue = string | number | boolean | undefined

export type ConfigValues = Partial<Record<ConfigKey, ConfigValue>>

/**
 * Spotify objects
 */

export type SpotifyObject<T> = {
  type: T
  id: string
  name: string
  href: string
  uri: string
  external_urls: {
    spotify: string
  }
}

export type User = Omit<SpotifyObject<'user'>, 'name'>

export type Artist = SpotifyObject<'artist'>

export type AlbumSimplified = SpotifyObject<'album'> & {
  album_group: AlbumGroup
  album_type: AlbumGroup.ALBUM | AlbumGroup.SINGLE | AlbumGroup.COMPILATION
  artists: Artist[]
  release_date: string
}

export type Album = Omit<AlbumSimplified, 'album_group'> & {
  tracks: Paged<TrackSimplified>
}

export type TrackSimplified = SpotifyObject<'track'> & {
  artists: Artist[]
}

export type Track = TrackSimplified & {
  album: AlbumSimplified
}

export type PlaylistTrack = {
  track: Track
}

export type Playlist = SpotifyObject<'playlist'> & {
  description: string | null
  tracks: Paged<PlaylistTrack>
}

/**
 * API contracts
 */

export type Paged<T> = {
  items: T[]
  href: string
  next: string | null
  previous: string | null
  limit: number
  offset: number
  total: number
}

export type GetArtistAlbumsParams = {
  include_groups?: string
  market?: string
  limit?: string
  offset?: string
}

export type GetAlbumsParams = {
  ids: string
  market?: string
}

export type GetAlbumsResponse = {
  albums: Album[]
}

export type GetPlaylistParams = {
  fields?: string
  market?: string
}

export type CreatePlaylistBody = {
  name: string
  description?: string
  public?: boolean
}

export type AddTracksToPlaylistBody = {
  uris: string[]
  position: number
}

/**
 * Auth API contracts
 */

export type AuthorizeParams = {
  response_type: 'code'
  client_id: string
  redirect_uri: string
  scope: string
}

export type AuthorizeResponse = {
  code?: string
  error?: string
  state?: string
}

export type RefreshTokenRequest = {
  grant_type: 'refresh_token'
  refresh_token: string
}

export type RefreshTokenResponse = {
  access_token: string
  expires_in: number
}

export type ExchangeAuthCodeRequest = {
  grant_type: 'authorization_code'
  code: string
  redirect_uri: string
}

/**
 * Auth API service
 */

export type ExchangeAuthCodeResponse = RefreshTokenResponse & {
  refresh_token: string
}

export type ExchangeAuthCodeResult = RefreshTokenResult & {
  refreshToken: string
}

export type RefreshTokenResult = {
  accessToken: string
  tokenExpiration: string
}

/**
 * Discography service
 */

export type AlbumTracksTuple = readonly [AlbumSimplified, TrackSimplified[]]

export type DiscographyResult = {
  artist: Artist
  trackIds: string[]
}
