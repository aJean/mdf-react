import { IApi } from '@mdfjs/types';
import { dirname, resolve as resolvePath } from 'path';
import { chalkPrints, genModelsPath } from '@mdfjs/utils';
import { InjectOpts, inject } from './inject';

/**
 * @file 集成业务框架 - rematch
 */

export default function (api: IApi) {
  const watch = api.createWatchFn();
  const modelPath = genModelsPath(api);
  const rematchPath = dirname(require.resolve('@rematch/core/package.json'));

  api.onCodeGenerate({
    name: 'genRematch',
    fn() {
      const injectOpts: InjectOpts = { api, rematchPath, modelPath };
      inject(injectOpts);

      watch({
        api,
        watchOpts: {
          path: resolvePath(modelPath),
          keys: ['add', 'unlink', 'addDir', 'unlinkDir', 'change'],
          onChange: function () {
            inject(injectOpts);
          },
        },
        onExit: () => chalkPrints([['unwatch:', 'yellow'], ` dva ${modelPath}`]),
      });
    },
  });

  api.addRuntimeExports(() => ({
    all: true,
    source: require.resolve('./exports'),
  }));
}
