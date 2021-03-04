"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _path = require("path");

var _utils = require("@mdfjs/utils");

/**
 * @file 工程入口文件 .tmp/mdf.tsx
 *       兼容 dva 和 fundamental 两种数据流框架
 */
function importsfy(sourceList) {
  return sourceList.map(source => `import '${source}';`);
}

function _default(api) {
  api.onCodeGenerate(function () {
    const Mustache = api.Mustache,
          PluginType = api.PluginType,
          paths = api.paths;

    const _api$getConfig = api.getConfig(),
          project = _api$getConfig.project;

    const tpl = api.getFile((0, _path.join)(__dirname, 'mdf.tpl'));
    const content = Mustache.render(tpl, {
      useDva: project.framework === 'dva',
      importsPolyfill: importsfy(api.invokePlugin({
        key: 'importsPolyfill',
        type: PluginType.add,
        initValue: []
      })).join('\r\n'),
      importsAhead: importsfy(api.invokePlugin({
        key: 'importsAhead',
        type: PluginType.add,
        initValue: []
      })).join('\r\n'),
      importsBehind: importsfy(api.invokePlugin({
        key: 'importsBehind',
        type: PluginType.add,
        initValue: []
      })).join('\r\n'),
      globalCode: api.invokePlugin({
        key: 'globalCode',
        type: PluginType.add,
        initValue: []
      }).join('\r\n')
    });
    api.writeFile(`${paths.absTmpPath}/mdf.tsx`, (0, _utils.prettierFormat)(content));
  });
}