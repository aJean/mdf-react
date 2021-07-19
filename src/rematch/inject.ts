import { IApi } from '@mdfjs/types';
import { resolve as resolvePath, join, dirname, basename, extname } from 'path';
import { globFind, chalkPrints, prettierFormat } from '@mdfjs/utils';
import { checkModel } from '../fundamental/parse';

/**
 * @file 自动注入 model 插件
 */

export default function (api: IApi, rematchPath: string, modelsPath: string) {
  const { paths, Mustache } = api;
  const { isDev, project } = api.getConfig();
  const matches = globFind(`${modelsPath}/**/*.{ts,js,tsx,jsx}`).filter(
    (path) => !/dva_/.test(path),
  );
  const models = matches
    .map((file: string) => {
      const error = checkModel(file, api);

      if (error) {
        const info = [['error: ', 'red'], ` ${error.msg}`];
        if (isDev) {
          api.addProcessDone(() => chalkPrints(info));
        } else {
          chalkPrints(info);
          process.exit(1);
        }
      }

      const modelName = basename(file, extname(file));
      const absFilePath = resolvePath(file);

      if (!modelName) {
        return chalkPrints([['error: ', 'red'], ` 解析${file}失败`]);
      }

      return {
        name: modelName,
        file,
        absFilePath,
        importPath: absFilePath.replace('.ts', ''),
      };
    })
    .filter(Boolean);

  // 写入 app
  const initModels = `{${models.map((model: any) => `${model.name}`.trim()).join(',')}}`;
  const tpl = api.getFile(join(__dirname, './app.tpl'));
  const content = Mustache.render(tpl, {
    models,
    initModels,
    rematchPath,
    reduxPath: dirname(require.resolve('react-redux/package.json')),
  });
  api.writeFile(`${paths.absTmpPath}/plugins-rematch/app.ts`, prettierFormat(content));

  // 写入 typings
  const typesTpl = api.getFile(join(__dirname, './types.tpl'));
  const typesContent = Mustache.render(typesTpl, { models, rematchPath });
  api.writeFile(`${paths.absTmpPath}/plugins-rematch/type.d.ts`, prettierFormat(typesContent));
}
