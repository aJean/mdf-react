"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _path = require("path");

var _lodash = _interopRequireDefault(require("lodash"));

var _utils = require("@mdfjs/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file router history 配置
 */
function _default(api) {
  const paths = api.paths,
        Mustache = api.Mustache;
  api.describe({
    key: 'history',
    config: {
      schema(joi) {
        return joi.object({
          type: joi.string().allow('browser', 'hash', 'memory').default('history'),
          getUserConfirmation: joi.string()
        });
      },

      default: {
        type: 'browser'
      }
    }
  });
  api.onCodeGenerate(function () {
    const config = api.getConfig();
    const tpl = api.getFile((0, _path.join)(__dirname, 'history.tpl'));
    const opts = config.history; // history basename

    if (opts.type === 'browser' || opts.type === 'hash') {
      opts.basename = config.base || '';
    }

    let content = Mustache.render(tpl, {
      // browser - createBrowserHistory
      creator: `create${_lodash.default.upperFirst(opts.type)}History`,
      // 不能使用 mdf
      runtimePath: require.resolve('../exports'),
      options: JSON.stringify(opts, null, 2)
    });

    if (opts.getUserConfirmation) {
      const modulePath = `require('${(0, _path.join)(paths.absSrcPath, opts.getUserConfirmation)}').default`;
      content = content.replace(/"getUserConfirmation":\s*"[^"]*"/, `"getUserConfirmation": ${modulePath}`);
    }

    api.writeFile(`${paths.absTmpPath}/history.ts`, (0, _utils.prettierFormat)(content));
  });
  api.addRuntimeExports(() => {
    return {
      specifiers: ['history'],
      source: `./history`
    };
  });
}