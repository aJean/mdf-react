import { dirname } from 'path';

/**
 * @file babel for react
 */

export default function getBabelOpts(opts: any) {
  const { isDev = false, isTest = false } = opts;
  const presets = [];
  const plugins = [];

  if (isTest) {
    presets.push([require('@babel/preset-env').default, { targets: { node: 'current' } }]);
  } else {
    // 使用 .browserslist
    presets.push([
      require.resolve('@babel/preset-env'),
      {
        useBuiltIns: 'entry',
        corejs: 3,
        modules: false, // 为 tree-shaking 保留 esmodule 的 import
      },
    ]);
  }

  presets.push([
    require.resolve('@babel/preset-react'),
    {
      development: isDev || isTest,
      useBuiltIns: true,
    },
  ]);

  presets.push([require.resolve('@babel/preset-typescript')]);

  // 默认配置 { corejs: false, helpers: true, regenerator: true }
  plugins.push([
    require.resolve('@babel/plugin-transform-runtime'),
    {
      version: require('@babel/runtime/package.json').version,
      absoluteRuntime: dirname(require.resolve('@babel/runtime/package.json')),
      useESModules: true,
    },
  ]);

  plugins.push([require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }]);
  plugins.push([require.resolve('@babel/plugin-proposal-private-methods'), { loose: true }]);
  plugins.push([
    require.resolve('@babel/plugin-proposal-private-property-in-object'),
    { loose: true },
  ]);
  plugins.push([require.resolve('@babel/plugin-proposal-class-properties'), { loose: true }]);

  // 按需加载配置，例如 antd
  if (opts.imports) {
    opts.imports.forEach((item: any) => {
      plugins.push([require.resolve('babel-plugin-import'), item, item.libraryName]);
    });
  }

  // 这一类语法增强插件是否有必要
  // @babel/plugin-proposal-export-default-from
  // @babel/plugin-proposal-pipeline-operator
  // @babel/plugin-proposal-do-expressions
  // @babel/plugin-proposal-function-bind

  return { cacheDirectory: true, presets, plugins };
}
