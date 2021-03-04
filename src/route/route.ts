import { join, resolve as resolvePath } from 'path';
import DynamicRoute from './getRoutes';
import { IApi } from '@mdfjs/types';
import { prettierFormat, chalkPrints, genRoutesPath } from '@mdfjs/utils';

/**
 * @file 路由约束插件
 */

export default function (api: IApi) {
  const watch = api.createWatchFn();
  const routesPath = genRoutesPath(api);
  const dynamicRoutes = new DynamicRoute({ rootDir: routesPath });

  // watch 放在外面会导致执行时机过早，不必要的挂载
  api.onCodeGenerate(function () {
    genRoutes();

    watch({
      api,
      watchOpts: {
        path: resolvePath(routesPath),
        keys: ['add', 'unlink', 'addDir', 'unlinkDir'],
        onChange: genRoutes,
      },
      onExit: () => chalkPrints([['unwatch:', 'yellow'], ` ${routesPath}`]),
    });
  });

  function genRoutes() {
    const { paths } = api;
    const data = dynamicRoutes.getRoutes();

    if (!data) {
      return;
    }

    try {
      const tpl = api.getFile(join(__dirname, './route.tpl'));
      const itemTpl = api.getFile(join(__dirname, './item.tpl'));
      const result = api.Mustache.render(
        tpl!,
        { ...data, data: [data.data] },
        {
          item: itemTpl,
        },
      );

      api.writeFile(`${paths.absTmpPath}/routes.tsx`, prettierFormat(result));
    } catch (err) {
      api.chalkPrint(err.stack, 'red');
    }
  }
}
