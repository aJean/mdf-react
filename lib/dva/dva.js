"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _path = require("path");

var _utils = require("@mdfjs/utils");

var _inject = require("./inject");

/**
 * @file 集成业务框架 - dva
 */
function _default(api) {
  const watch = api.createWatchFn();
  const modelPath = (0, _utils.genModelsPath)(api);
  const dvaPath = (0, _path.dirname)(require.resolve('dva/package.json'));
  api.onCodeGenerate({
    name: 'genDva',

    fn() {
      const paths = api.paths,
            Mustache = api.Mustache;
      const injectOpts = {
        api,
        dvaPath,
        modelPath
      };
      (0, _inject.inject)(injectOpts);
      const exportTpl = api.getFile((0, _path.join)(__dirname, './exports.tpl'));
      const exportContent = Mustache.render(exportTpl, {
        dvaPath
      });
      api.writeFile(`${paths.absTmpPath}/plugins-dva/exports.ts`, (0, _utils.prettierFormat)(exportContent));
      watch({
        api,
        watchOpts: {
          path: (0, _path.resolve)(modelPath),
          keys: ['add', 'unlink', 'addDir', 'unlinkDir', 'change'],
          onChange: function onChange() {
            (0, _inject.inject)(injectOpts);
          }
        },
        onExit: () => (0, _utils.chalkPrints)([['unwatch:', 'yellow'], ` dva ${modelPath}`])
      });
    }

  });
  api.addRuntimeExports(() => ({
    all: true,
    source: `${api.paths.absTmpPath}/plugins-dva/exports`
  }));
}