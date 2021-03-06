import { IApi } from '@mdfjs/types';
import { resolve as resolvePath, join, dirname, basename, extname } from 'path';
import { chalkPrints, prettierFormat } from '@mdfjs/utils';
import { checkModel } from '../compiler/parse';
import { findFiles } from '../utils';

/**
 * @file 自动注入 model 插件
 */

export type InjectOpts = {
  api: IApi;
  dvaPath: string;
  modelPath: string;
};

export function inject(opts: InjectOpts) {
  const { api, dvaPath, modelPath } = opts;
  const { paths, Mustache } = api;
  const { isDev, project } = api.getConfig();
  const matches = findFiles(modelPath, 'rematch_');
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

  // 约定文件名作为 model name
  const RegisterModels = models
    .map((model: any) => {
      const { absFilePath, name } = model;
      const modelTpl = `app.model({ ...require('${absFilePath}').default, namespace: '${name}' });`;
      return modelTpl.trim();
    })
    .join('\r\n');

  // 写入 app
  const tpl = api.getFile(join(__dirname, './app.tpl'));
  const content = Mustache.render(tpl, {
    RegisterModels,
    dvaPath,
    persistPath: project.persist && dirname(require.resolve('redux-persist')),
    loadingPath: require.resolve('dva-loading/dist/index.js'),
    immerPath: require.resolve('dva-immer/dist/index.js'),
  });
  api.writeFile(`${paths.absTmpPath}/plugins-dva/app.ts`, prettierFormat(content));

  // 写入 typings
  const typesTpl = api.getFile(join(__dirname, './types.tpl'));
  const typesContent = Mustache.render(typesTpl, { models, loading: true });
  api.writeFile(`${paths.absTmpPath}/plugins-dva/type.d.ts`, prettierFormat(typesContent));
}
