"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getBabelOpts;

var _path = require("path");

/**
 * @file babel for react
 */
function getBabelOpts(opts) {
  const _opts$isDev = opts.isDev,
        isDev = _opts$isDev === void 0 ? false : _opts$isDev,
        _opts$isTest = opts.isTest,
        isTest = _opts$isTest === void 0 ? false : _opts$isTest;
  const presets = [];
  const plugins = [];

  if (isTest) {
    presets.push([require('@babel/preset-env').default, {
      targets: {
        node: 'current'
      }
    }]);
  } else {
    // 使用 .browserslist
    presets.push([require.resolve('@babel/preset-env'), {
      useBuiltIns: 'entry',
      corejs: 3,
      modules: false // 为 tree-shaking 保留 esmodule 的 import

    }]);
  }

  presets.push([require.resolve('@babel/preset-react'), {
    development: isDev || isTest,
    useBuiltIns: true
  }]);
  presets.push([require.resolve('@babel/preset-typescript')]); // 默认配置 { corejs: false, helpers: true, regenerator: true }

  plugins.push([require.resolve('@babel/plugin-transform-runtime'), {
    version: require('@babel/runtime/package.json').version,
    absoluteRuntime: (0, _path.dirname)(require.resolve('@babel/runtime/package.json')),
    useESModules: true
  }]);
  plugins.push([require.resolve('@babel/plugin-proposal-decorators'), {
    legacy: true
  }]);
  plugins.push([require.resolve('@babel/plugin-proposal-class-properties'), {
    loose: true
  }]); // 按需加载配置，例如 antd

  if (opts.imports) {
    opts.imports.forEach(item => {
      plugins.push([require.resolve('babel-plugin-import'), item, item.libraryName]);
    });
  } // babel-plugin-transform-react-remove-prop-types
  // 这一类语法增强插件是否有必要
  // @babel/plugin-proposal-export-default-from
  // @babel/plugin-proposal-pipeline-operator
  // @babel/plugin-proposal-do-expressions
  // @babel/plugin-proposal-function-bind


  return {
    cacheDirectory: true,
    presets,
    plugins
  };
}