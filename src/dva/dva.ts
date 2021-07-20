import { IApi } from '@mdfjs/types';
import { join, dirname, resolve as resolvePath } from 'path';
import { prettierFormat, chalkPrints, genModelsPath } from '@mdfjs/utils';
import { InjectOpts, inject } from './inject';

/**
 * @file 集成业务框架 - dva
 */

export default function (api: IApi) {
  const watch = api.createWatchFn();
  const modelPath = genModelsPath(api);
  const dvaPath = dirname(require.resolve('dva/package.json'));

  api.onCodeGenerate({
    name: 'genDva',
    fn() {
      const { paths, Mustache } = api;
      const injectOpts: InjectOpts = { api, dvaPath, modelPath };

      inject(injectOpts);

      const exportTpl = api.getFile(join(__dirname, './exports.tpl'));
      const exportContent = Mustache.render(exportTpl, { dvaPath });
      api.writeFile(`${paths.absTmpPath}/plugins-dva/exports.ts`, prettierFormat(exportContent));

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
    source: `${api.paths.absTmpPath}/plugins-dva/exports`,
  }));
}
