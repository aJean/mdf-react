"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _utils = require("@mdfjs/utils");

var _path = require("path");

var _inject = _interopRequireDefault(require("./inject"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file 集成业务框架 - fundamental
 * @todo 因为导出的问题 @medlinker/fundamental 要安装在项目中
 */
function _default(api) {
  const watch = api.createWatchFn();
  const modelsPath = (0, _utils.genModelsPath)(api);
  api.onCodeGenerate(function () {
    (0, _inject.default)(api, modelsPath);
    watch({
      api,
      watchOpts: {
        path: (0, _path.resolve)(modelsPath),
        keys: ['add', 'unlink', 'addDir', 'unlinkDir', 'change'],
        onChange: function onChange() {
          (0, _inject.default)(api, modelsPath);
        }
      },
      onExit: () => (0, _utils.chalkPrints)([['unwatch:', 'yellow'], ` fundamental ${modelsPath}`])
    });
  });
}