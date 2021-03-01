import { IApi } from '@mdfjs/types';
import { watch } from '@mdfjs/utils';

/**
 * @file 考虑到 path 会因为不同类型的项目而变化
 */

export function genRootPath(api: any) {
  const { framework } = api.getConfig();

  return framework.root || 'src';
}

export function genRoutesPath(api: any) {
  return `${genRootPath(api)}/pages`;
}

export function genModelsPath(api: any) {
  return `${genRootPath(api)}/models`;
}
