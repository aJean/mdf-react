"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _path = require("path");

var _utils = require("@mdfjs/utils");

var _inject = require("./inject");

/**
 * @file 集成业务框架 - rematch
 */
function _default(api) {
  const watch = api.createWatchFn();
  const modelPath = (0, _utils.genModelsPath)(api);
  const rematchPath = (0, _path.dirname)(require.resolve('@rematch/core/package.json'));
  api.onCodeGenerate({
    name: 'genRematch',

    fn() {
      const injectOpts = {
        api,
        rematchPath,
        modelPath
      };
      (0, _inject.inject)(injectOpts);
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
    source: require.resolve('./exports')
  }));
}