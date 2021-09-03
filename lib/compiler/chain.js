"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _babel = _interopRequireDefault(require("./babel"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file 配置 @mdfjs/react 的 webpack chain
 */
function _default(api) {
  const _api$getConfig = api.getConfig(),
        isDev = _api$getConfig.isDev;

  api.chainWebpack(chain => {
    chain.module.rules.delete('babelJs'); // 内置 react

    chain.resolve.alias.merge({
      'react-native': 'react-native-web',
      // 使用内置的 react 版本
      'react-dom': require.resolve('react-dom'),
      react: require.resolve('react')
    });
    chain.module.rule('reactJs').test(/\.(js|jsx|ts|tsx)$/).exclude.add(/node_modules/).end().use('babelLoader').loader(require.resolve('babel-loader')).options((0, _babel.default)({
      isDev
    }));
  });
}