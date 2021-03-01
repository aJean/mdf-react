"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _chain = _interopRequireDefault(require("./compiler/chain"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file react 插件集
 */
function _default(api) {
  // 设置 default 无效，因为是在 service 实例化之前读取
  api.describe({
    key: 'framework',
    config: {
      schema(joi) {
        return joi.object({
          type: joi.string().allow('dva', 'fundamental'),
          root: joi.string(),
          persist: joi.boolean()
        }).required();
      },

      default: {
        type: 'dva',
        persist: false
      }
    }
  });
  api.changeUserConfig(config => {
    config.appEntry = `${api.cwd}/.tmp/mdf.tsx`;
    return config;
  });

  const _api$getConfig = api.getConfig(),
        framework = _api$getConfig.framework;

  const presets = [require.resolve('./route/route'), require.resolve('./history/history'), require.resolve('./mdf/mdf')];

  switch (framework.type) {
    case 'dva':
      presets.push(require.resolve('./dva/dva'));
      break;

    case 'fundamental':
      presets.push(require.resolve('./fundamental/fundamental'));
      break;
  }

  (0, _chain.default)(api);
  api.addRuntimeExports(function () {
    return {
      all: true,
      source: require.resolve('./exports')
    };
  });
  return {
    presets
  };
}