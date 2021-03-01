import { IApi, IJoi } from '@mdfjs/types';
import chain from './compiler/chain';

/**
 * @file react 插件集
 */

export default function (api: IApi) {
  // 设置 default 无效，因为是在 service 实例化之前读取
  api.describe({
    key: 'framework',

    config: {
      schema(joi: IJoi) {
        return joi
          .object({
            type: joi.string().allow('dva', 'fundamental'),
            root: joi.string(),
            persist: joi.boolean(),
          })
          .required();
      },

      default: { type: 'dva', persist: false },
    },
  });

  api.changeUserConfig((config: any) => {
    config.appEntry = `${api.cwd}/.tmp/mdf.tsx`;
    return config;
  });

  const { framework } = api.getConfig();
  const presets = [
    require.resolve('./route/route'),
    require.resolve('./history/history'),
    require.resolve('./mdf/mdf'),
  ];

  switch (framework.type) {
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
