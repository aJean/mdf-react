"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _path = require("path");

var _getRoutes = _interopRequireDefault(require("./getRoutes"));

var _utils = require("@mdfjs/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * @file 路由约束插件
 */
function _default(api) {
  const watch = api.createWatchFn();
  const routesPath = (0, _utils.genRoutesPath)(api);
  const dynamicRoutes = new _getRoutes.default({
    rootDir: routesPath
  }); // watch 放在外面会导致执行时机过早，不必要的挂载

  api.onCodeGenerate({
    name: 'genRoutes',

    fn() {
      genRoutes();
      watch({
        api,
        watchOpts: {
          path: (0, _path.resolve)(routesPath),
          keys: ['add', 'unlink', 'addDir', 'unlinkDir'],
          onChange: genRoutes
        },
        onExit: () => (0, _utils.chalkPrints)([['unwatch:', 'yellow'], ` ${routesPath}`])
      });
    }

  });

  function genRoutes() {
    const paths = api.paths;
    const data = dynamicRoutes.getRoutes();

    if (!data) {
      return;
    }

    try {
      const tpl = api.getFile((0, _path.join)(__dirname, './route.tpl'));
      const itemTpl = api.getFile((0, _path.join)(__dirname, './item.tpl'));
      const result = api.Mustache.render(tpl, _objectSpread(_objectSpread({}, data), {}, {
        data: [data.data]
      }), {
        item: itemTpl
      });
      api.writeFile(`${paths.absTmpPath}/routes.tsx`, (0, _utils.prettierFormat)(result));
    } catch (e) {
      api.chalkPrint(e.stack, 'red');
    }
  }
}