import { globFind } from '@mdfjs/utils';

/**
 * @file utils
 */

export function findFiles(path: string, excludes: string | string[] = []) {
  if (typeof excludes == 'string') {
    excludes = [excludes];
  }

  return globFind(`${path}/**/*.{ts,js,tsx,jsx}`).filter((path) => {
    for (let reg of excludes) {
      if (new RegExp(reg, 'g').test(path)) {
        return false;
      }
    }

    return true;
  });
}
