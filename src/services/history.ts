import { gzipSync, unzipSync } from 'zlib';
import { pathExistsSync, ensureFileSync, writeFileSync, readFileSync } from 'fs-extra';
import { IConfig } from '@oclif/config';
import { HistoryInterface } from '../types';

export default class History implements HistoryInterface {
  private basePath: string;

  constructor(oclifConfig: IConfig) {
    this.basePath = `${oclifConfig.configDir}/history`;
  }

  load(artistId: string, playlistId: string) {
    const path = this.getPath(artistId, playlistId);

    if (!pathExistsSync(path)) {
      return [];
    }

    const zippedData = readFileSync(path);
    const data = unzipSync(zippedData).toString();
    const trackIds = data.match(/.{22}/g) as string[];

    return trackIds;
  }

  save(artistId: string, playlistId: string, trackIds: string[]) {
    const path = this.getPath(artistId, playlistId);
    const zippedData = gzipSync(trackIds.join(''));

    ensureFileSync(path);
    writeFileSync(path, zippedData);
  }

  private getPath(artistId: string, playlistId: string) {
    return `${this.basePath}/${artistId}/${playlistId}`;
  }
}
