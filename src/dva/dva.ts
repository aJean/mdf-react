import { IApi } from '@mdfjs/types';
import { join, dirname, resolve as resolvePath } from 'path';
import { prettierFormat, chalkPrints, genModelsPath } from '@mdfjs/utils';
import injectModels from './inject';

/**
 * @file 集成业务框架 - dva
 */

export default function (api: IApi) {
  const watch = api.createWatchFn();
  const dvaPath = dirname(require.resolve('dva/package.json'));
  const modelsPath = genModelsPath(api);

  api.onCodeGenerate({
    name: 'genDva',
    fn() {
      const { paths, Mustache } = api;

      injectModels(api, dvaPath, modelsPath);

      const exportTpl = api.getFile(join(__dirname, './exports.tpl'));
      const exportContent = Mustache.render(exportTpl, { dvaPath });
      api.writeFile(`${paths.absTmpPath}/plugins-dva/exports.ts`, prettierFormat(exportContent));

      watch({
        api,
        watchOpts: {
          path: resolvePath(modelsPath),
          keys: ['add', 'unlink', 'addDir', 'unlinkDir', 'change'],
          onChange: function () {
            injectModels(api, dvaPath, modelsPath);
          },
        },
        onExit: () => chalkPrints([['unwatch:', 'yellow'], ` dva ${modelsPath}`]),
      });
    },
  });

  api.addRuntimeExports(() => ({
    all: true,
    source: `${api.paths.absTmpPath}/plugins-dva/exports`,
  }));
}
