import { IApi, IJoi } from '@mdfjs/types';
import chain from './compiler/chain';

/**
 * @file react 插件集
 */

export default function (api: IApi) {
  api.changeUserConfig((config: any) => {
    config.appEntry = `${api.cwd}/.tmp/mdf.tsx`;
    return config;
  });

  const { project } = api.getConfig();
  const presets = [
    require.resolve('./route/route'),
    require.resolve('./history/history'),
    require.resolve('./mdf/mdf'),
  ];

  switch (project.framework) {
    case 'dva':
      presets.push(require.resolve('./dva/dva'));
      break;
    case 'fundamental':
      presets.push(require.resolve('./fundamental/fundamental'));
      break;
  }

  chain(api);
  api.addRuntimeExports(function () {
    return {
      all: true,
      source: require.resolve('./exports'),
    };
  });

  return { presets };
}
