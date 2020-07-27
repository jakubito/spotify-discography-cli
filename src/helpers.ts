import { CONFIG_KEYS } from './enums';
import { ConfigKey } from './types';

export function isNumeric(input: string) {
  return Boolean(input) && !Number.isNaN(Number(input));
}

export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function chunks<T>(inputArray: T[], chunkSize: number) {
  const input = [...inputArray];
  const chunks = [];

  while (input.length > 0) {
    chunks.push(input.splice(0, chunkSize));
  }

  return chunks;
}

export function isValidConfigKey(key: any): key is ConfigKey {
  return CONFIG_KEYS.includes(key);
}

export function getTokenExpiration(seconds: number) {
  const date = new Date();

  date.setSeconds(date.getSeconds() + seconds - 10 * 60);

  return date.toISOString();
}

export function trackUri(trackId: string) {
  return `spotify:track:${trackId}`;
}
