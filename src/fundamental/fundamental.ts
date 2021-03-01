import { IApi } from '@mdfjs/types';
import { chalkPrints } from '@mdfjs/utils';
import { resolve as resolvePath } from 'path';
import injectModels from './inject';
import { genModelsPath } from '../utils';

/**
 * @file 集成业务框架 - fundamental
 * @todo 因为导出的问题 @medlinker/fundamental 要安装在项目中
 */

export default function (api: IApi) {
  const watch = api.createWatchFn();
  const modelsPath = genModelsPath(api);

  api.onCodeGenerate(function () {
    injectModels(api, modelsPath);

    watch({
      api,
      watchOpts: {
        path: resolvePath(modelsPath),
        keys: ['add', 'unlink', 'addDir', 'unlinkDir', 'change'],
        onChange: function () {
          injectModels(api, modelsPath);
        },
      },
      onExit: () => chalkPrints([['unwatch:', 'yellow'], ` fundamental ${modelsPath}`]),
    });
  });
}
