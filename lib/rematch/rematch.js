"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _path = require("path");

var _utils = require("@mdfjs/utils");

var _inject = _interopRequireDefault(require("./inject"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file 集成业务框架 - rematch
 */
function _default(api) {
  const watch = api.createWatchFn();
  const rematchPath = (0, _path.dirname)(require.resolve('@rematch/core/package.json'));

  const reduxPath = require.resolve('react-redux');

  const modelsPath = (0, _utils.genModelsPath)(api);
  api.onCodeGenerate({
    name: 'genRematch',

    fn() {
      const paths = api.paths,
            Mustache = api.Mustache;
      (0, _inject.default)(api, rematchPath, modelsPath);
      const exportTpl = api.getFile((0, _path.join)(__dirname, './exports.tpl'));
      const exportContent = Mustache.render(exportTpl, {
        rematchPath,
        reduxPath
      }); // api.writeFile(
      //   `${paths.absTmpPath}/plugins-rematch/exports.ts`,
      //   prettierFormat(exportContent),
      // );

      watch({
        api,
        watchOpts: {
          path: (0, _path.resolve)(modelsPath),
          keys: ['add', 'unlink', 'addDir', 'unlinkDir', 'change'],
          onChange: function onChange() {
            (0, _inject.default)(api, rematchPath, modelsPath);
          }
        },
        onExit: () => (0, _utils.chalkPrints)([['unwatch:', 'yellow'], ` dva ${modelsPath}`])
      });
    }

  });
  api.addRuntimeExports(() => ({
    all: true,
    source: require.resolve('./exports')
  }));
}