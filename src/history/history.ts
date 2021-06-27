import { IApi, IJoi } from '@mdfjs/types';
import { join, dirname } from 'path';
import Loadsh from 'lodash';
import { prettierFormat } from '@mdfjs/utils';

/**
 * @file router history 配置
 */

export default function (api: IApi) {
  const { paths, Mustache } = api;

  api.describe({
    key: 'history',
    config: {
      schema(joi: IJoi) {
        return joi.object({
          type: joi.string().allow('browser', 'hash', 'memory').default('history'),
          getUserConfirmation: joi.string(),
        });
      },

      default: {
        type: 'browser',
      },
    },
  });

  api.onCodeGenerate({
    name: 'genHistory',
    fn() {
      const config = api.getConfig();
      const tpl = api.getFile(join(__dirname, 'history.tpl'));
      const opts = config.history;

      // history basename
      if (opts.type === 'browser' || opts.type === 'hash') {
        opts.basename = config.base || '';
      }

      let content = Mustache.render(tpl, {
        // browser - createBrowserHistory
        creator: `create${Loadsh.upperFirst(opts.type)}History`,
        // 不能使用 mdf
        runtimePath: require.resolve('../exports'),
        options: JSON.stringify(opts, null, 2),
      });

      if (opts.getUserConfirmation) {
        const modulePath = `require('${join(paths.absSrcPath, opts.getUserConfirmation)}').default`;
        content = content.replace(
          /"getUserConfirmation":\s*"[^"]*"/,
          `"getUserConfirmation": ${modulePath}`,
        );
      }

      api.writeFile(`${paths.absTmpPath}/history.ts`, prettierFormat(content));
    },
  });

  api.addRuntimeExports(() => {
    return {
      specifiers: ['history'],
      source: `./history`,
    };
  });
}
