import { IApi } from '@mdfjs/types';
import { resolve as resolvePath, join, basename, extname } from 'path';
import { chalkPrints, prettierFormat } from '@mdfjs/utils';
import { checkModel } from '../compiler/parse';
import { findFiles } from '../utils';

/**
 * @file 自动注入 model 插件
 */

export type InjectOpts = {
  api: IApi;
  rematchPath: string;
  modelPath: string;
};

export function inject(opts: InjectOpts) {
  const { api, rematchPath, modelPath } = opts;
  const { paths, Mustache } = api;
  const { isDev, project } = api.getConfig();
  const matches = findFiles(modelPath, 'dva_');
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
    persistPath: project.persist,
    loadingPath: true,
    immerPath: true,
  });
  api.writeFile(`${paths.absTmpPath}/plugins-rematch/app.ts`, prettierFormat(content));

  // 写入 typings
  const typesTpl = api.getFile(join(__dirname, './types.tpl'));
  const typesContent = Mustache.render(typesTpl, { models, rematchPath });
  api.writeFile(`${paths.absTmpPath}/plugins-rematch/type.d.ts`, prettierFormat(typesContent));
}
