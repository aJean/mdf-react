"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _path = require("path");

var _utils = require("@mdfjs/utils");

var _inject = _interopRequireDefault(require("./inject"));

var _utils2 = require("../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file 集成业务框架 - dva
 */
function _default(api) {
  const watch = api.createWatchFn();
  const dvaPath = (0, _path.dirname)(require.resolve('dva/package.json'));
  const modelsPath = (0, _utils2.genModelsPath)(api);
  api.onCodeGenerate(function () {
    const paths = api.paths,
          Mustache = api.Mustache;
    (0, _inject.default)(api, dvaPath, modelsPath);
    const exportTpl = api.getFile((0, _path.join)(__dirname, './exports.tpl'));
    const exportContent = Mustache.render(exportTpl, {
      dvaPath
    });
    api.writeFile(`${paths.absTmpPath}/plugins-dva/exports.ts`, (0, _utils.prettierFormat)(exportContent));
    watch({
      api,
      watchOpts: {
        path: (0, _path.resolve)(modelsPath),
        keys: ['add', 'unlink', 'addDir', 'unlinkDir', 'change'],
        onChange: function onChange() {
          (0, _inject.default)(api, dvaPath, modelsPath);
        }
      },
      onExit: () => (0, _utils.chalkPrints)([['unwatch:', 'yellow'], ` dva ${modelsPath}`])
    });
  });
  api.addRuntimeExports(() => ({
    all: true,
    source: `${api.paths.absTmpPath}/plugins-dva/exports`
  }));
}