import { join } from 'path';
import { IApi } from '@mdfjs/types';
import { prettierFormat } from '@mdfjs/utils';

/**
 * @file 工程入口文件 .tmp/mdf.tsx
 *       兼容 dva 和 fundamental 两种数据流框架
 */

function importsfy(sourceList: string[]) {
  return sourceList.map((source) => `import '${source}';`);
}

export default function (api: IApi) {
  api.onCodeGenerate({
    name: 'genReact',
    fn() {
      const { Mustache, PluginType, paths } = api;
      const { project } = api.getConfig();
      const tpl = api.getFile(join(__dirname, 'mdf.tpl'));

      const content = Mustache.render(tpl, {
        useDva: project.framework === 'dva',

        importsPolyfill: importsfy(
          api.invokePlugin({
            key: 'importsPolyfill',
            type: PluginType.add,
            initValue: [],
          }),
        ).join('\r\n'),

        importsAhead: importsfy(
          api.invokePlugin({
            key: 'importsAhead',
            type: PluginType.add,
            initValue: [],
          }),
        ).join('\r\n'),

        importsBehind: importsfy(
          api.invokePlugin({
            key: 'importsBehind',
            type: PluginType.add,
            initValue: [],
          }),
        ).join('\r\n'),

        globalCode: api
          .invokePlugin({
            key: 'globalCode',
            type: PluginType.add,
            initValue: [],
          })
          .join('\r\n'),
      });

      api.writeFile(`${paths.absTmpPath}/mdf.tsx`, prettierFormat(content));
    },
  });
}
