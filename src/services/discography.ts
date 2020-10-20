import orderBy from 'lodash.orderby'
import zip from 'lodash.zip'
import { AlbumGroup, AlbumGroupPriority } from '../enums'
import { trackUri } from '../helpers'
import {
  DiscographyInterface,
  ApiInterface,
  AuthInterface,
  HistoryInterface,
  DiscographyResult,
  AlbumTracksTuple,
} from '../types'

export default class Discography implements DiscographyInterface {
  constructor(
    public auth: AuthInterface,
    public api: ApiInterface,
    public history: HistoryInterface
  ) {}

  async create(artistId: string) {
    await this.auth.ensureToken()

    const { artist, trackIds } = await this.getDiscography(artistId)
    const playlist = await this.api.createPlaylist(`${artist.name} Discography`)

    await this.api.addTracksToPlaylist(playlist.id, trackIds.map(trackUri))

    this.history.save(artistId, playlist.id, trackIds)

    return playlist
  }

  async update(artistId: string, playlistId: string, force?: boolean) {
    await this.auth.ensureToken()

    const playlist = await this.api.getPlaylist(playlistId)
    const { trackIds } = await this.getDiscography(artistId)

    const historyTracks = new Set(this.history.load(artistId, playlistId))
    const playlistTracks = new Set(
      playlist.tracks.items.map((playlistTrack) => playlistTrack.track.id)
    )

    const tracksToAdd = trackIds.filter(
      (trackId) => !playlistTracks.has(trackId) && (force || !historyTracks.has(trackId))
    )

    if (tracksToAdd.length > 0) {
      await this.api.addTracksToPlaylist(playlist.id, tracksToAdd.map(trackUri))

      for (const trackId of tracksToAdd) {
        historyTracks.add(trackId)
      }

      this.history.save(artistId, playlistId, [...historyTracks])
    }

    return playlist
  }

  private async getDiscography(artistId: string): Promise<DiscographyResult> {
    const trackNames = new Map<string, string>()
    const trackIds = []

    const artist = await this.api.getArtist(artistId)
    const albums = await this.api.getArtistAlbums(artistId)
    const tracks = await this.api.getAlbumsTracks(albums.map((album) => album.id))

    const tuples = zip(albums, tracks) as AlbumTracksTuple[]
    const tuplesOrdered = orderBy(tuples, ([album]) => album.release_date, 'desc')

    const tuplesFiltered = tuples.map(
      ([album, albumTracks]): AlbumTracksTuple => [
        album,
        albumTracks.filter((track) => {
          if (album.album_group === AlbumGroup.ALBUM) {
            return true
          }

          if (track.artists.find((artist) => artist.id === artistId)) {
            return true
          }

          if (track.name.match(new RegExp(artist.name, 'gi'))) {
            return true
          }

          return false
        }),
      ]
    )

    const tuplesGroupOrdered = orderBy(
      tuplesFiltered,
      [([album]) => AlbumGroupPriority[album.album_group], ([album]) => album.release_date],
      ['asc', 'desc']
    )

    for (const [album, albumTracks] of tuplesGroupOrdered) {
      for (const track of albumTracks) {
        if (!trackNames.has(track.name)) {
          trackNames.set(track.name, album.id)
        }
      }
    }

    for (const [album, albumTracks] of tuplesOrdered) {
      for (const track of albumTracks) {
        if (trackNames.get(track.name) === album.id) {
          trackIds.push(track.id)
        }
      }
    }

    return { artist, trackIds }
  }
}
