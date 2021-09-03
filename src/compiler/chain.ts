import { IApi } from '@mdfjs/types';
import geBabelOpts from './babel';

/**
 * @file 配置 @mdfjs/react 的 webpack chain
 */

export default function (api: IApi) {
  const { isDev } = api.getConfig();

  api.chainWebpack((chain) => {
    chain.module.rules.delete('babelJs');

    // 内置 react
    chain.resolve.alias.merge({
      'react-native': 'react-native-web',
      // 使用内置的 react 版本
      'react-dom': require.resolve('react-dom'),
      react: require.resolve('react'),
    });

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
