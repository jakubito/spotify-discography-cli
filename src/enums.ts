export const CONFIG_KEYS = [
  'authServerPort',
  'userId',
  'clientId',
  'clientSecret',
  'accessToken',
  'refreshToken',
  'tokenExpiration',
] as const;

export enum Scope {
  PLAYLIST_MODIFY_PRIVATE = 'playlist-modify-private',
  PLAYLIST_MODIFY_PUBLIC = 'playlist-modify-public',
}

export enum AlbumGroup {
  ALBUM = 'album',
  SINGLE = 'single',
  APPEARS_ON = 'appears_on',
  COMPILATION = 'compilation',
}

export const AlbumGroupPriority = {
  [AlbumGroup.ALBUM]: 0,
  [AlbumGroup.SINGLE]: 1,
  [AlbumGroup.APPEARS_ON]: 2,
  [AlbumGroup.COMPILATION]: 3,
} as const;

export enum ServerResponse {
  AUTH_ERROR = `ERROR!

Spotify authorization error :-(`,
  AUTH_SUCCESS = `SUCCESS!

Spotify account successfully authorized. You can now close this tab.


                      *****************
                 ******               ******
             ****                           ****
          ****                                 ***
        ***                                       ***
       **           ***               ***           **
     **           *******           *******          ***
    **            *******           *******            **
   **             *******           *******             **
   **               ***               ***               **
  **                                                     **
  **       *                                     *       **
  **      **                                     **      **
   **   ****                                     ****   **
   **      **                                   **      **
    **       ***                             ***       **
     ***       ****                       ****       ***
       **         ******             ******         **
        ***            ***************            ***
          ****                                 ****
             ****                           ****
                 ******               ******
                      *****************`,
}
