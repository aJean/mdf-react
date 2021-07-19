import { IApi } from '@mdfjs/types';
import { join, dirname, resolve as resolvePath } from 'path';
import { prettierFormat, chalkPrints, genModelsPath } from '@mdfjs/utils';
import injectModels from './inject';

/**
 * @file 集成业务框架 - rematch
 */

export default function (api: IApi) {
  const watch = api.createWatchFn();
  const rematchPath = dirname(require.resolve('@rematch/core/package.json'));
  const reduxPath = require.resolve('react-redux');
  const modelsPath = genModelsPath(api);

  api.onCodeGenerate({
    name: 'genRematch',
    fn() {
      const { paths, Mustache } = api;

      injectModels(api, rematchPath, modelsPath);

      const exportTpl = api.getFile(join(__dirname, './exports.tpl'));
      const exportContent = Mustache.render(exportTpl, { rematchPath, reduxPath });
      // api.writeFile(
      //   `${paths.absTmpPath}/plugins-rematch/exports.ts`,
      //   prettierFormat(exportContent),
      // );

      watch({
        api,
        watchOpts: {
          path: resolvePath(modelsPath),
          keys: ['add', 'unlink', 'addDir', 'unlinkDir', 'change'],
          onChange: function () {
            injectModels(api, rematchPath, modelsPath);
          },
        },
        onExit: () => chalkPrints([['unwatch:', 'yellow'], ` dva ${modelsPath}`]),
      });
    },
  });

  api.addRuntimeExports(() => ({
    all: true,
    source: require.resolve('./exports'),
  }));
}
