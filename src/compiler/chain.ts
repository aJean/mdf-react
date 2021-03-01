import { IApi } from '@mdfjs/types';
import geBabelOpts from './babel';

/**
 * @file 配置 @mdfjs/react 的 webpack chain
 */

export default function (api: IApi) {
  const { isDev } = api.getConfig();

  api.chainWebpack((chain) => {
    chain.module.rules.delete('babelJs');

    chain.module
      .rule('reactJs')
      .test(/\.(js|jsx|ts|tsx)$/)
      .exclude.add(/node_modules/)
      .end()
      .use('babelLoader')
      .loader(require.resolve('babel-loader'))
      .options(geBabelOpts({ isDev }));
  });
}
