"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _lodash = _interopRequireDefault(require("lodash"));

var _entities = require("./entities");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * @file 动态路由
 */
class DynamicRoute {
  constructor(opts) {
    this.rootDir = opts.rootDir || '';
    this.aliasPrefix = opts.aliasPrefix || '@';
    this.distFile = opts.distFile || _path.default.join('.tmp/routes.tsx');
    this.routeFileTag = opts.routeFileTag || '';
    this.routerLib = opts.routerLib || 'mdf';
    this.importRootPath = this.aliasPrefix + '/pages';
    this.getRoutes = _lodash.default.debounce(this.getRoutes, 600, {
      leading: true,
      trailing: true
    });
  }

  findJsFileWithoutExtends(dir, name) {
    const result = ['.jsx', '.js', '.tsx', '.ts'].map(item => `${name}${item}`).find(item => _fs.default.existsSync(_path.default.join(dir, item)));

    if (result) {
      return result;
    }

    return null;
  }

  getRoutes() {
    const ctx = {
      path: '/',
      dir: this.rootDir,
      layout: null,
      fallback: null,
      router: true,
      children: []
    };
    const imports = [];
    const lazyImports = []; // 根layout

    const rootLayoutFile = this.findJsFileWithoutExtends(this.rootDir, 'layout');

    if (rootLayoutFile) {
      ctx.layout = {
        importname: 'Layout',
        importpath: this.importRootPath + '/layout'
      };
      imports.push({
        name: ctx.layout.importname,
        path: ctx.layout.importpath
      });
    }

    const traverseDir = (dir, currentCtx, handleIndex = false) => {
      const fullDir = _path.default.join(this.rootDir, dir);

      _fs.default.readdirSync(fullDir).sort(this.sortFiles).filter(item => !/(^|\/)\.[^\/\.]/g.test(item)).forEach(item => {
        if (!(item.startsWith(this.routeFileTag) || _entities.reserveFiles.some(fitem => {
          if (item === fitem) {
            return true;
          }

          return false;
        }))) {
          return;
        }

        let name = item.replace(/\..+$/, ''); // layout 在外面处理，隔离图片样式文件

        if (!handleIndex && name === 'index' || name === 'layout' || _entities.rext.test(item)) {
          return;
        }

        const fullItem = _path.default.join(fullDir, item);

        const relativePath = _path.default.join(dir, item);

        if (_entities.rdir.test(fullItem)) {
          return;
        }

        const stat = _fs.default.statSync(fullItem);

        const importpath = this.getRouteImportPath(relativePath);
        const importname = importpath ? this.getOneImportName(importpath) : '';
        let routeFilePath = fullItem;
        let isFile = true; // 递归查找下层目录

        if (stat.isDirectory()) {
          const layoutFile = this.findJsFileWithoutExtends(fullItem, 'layout'); // 进目录前先找 layout

          if (layoutFile) {
            const desc = this.getRouteDesc(_path.default.join(fullItem, this.findJsFileWithoutExtends(fullItem, 'layout') || ''));
            const layoutpath = importpath + '/layout';
            const layoutname = this.getOneImportName(importpath + '/layout');
            const pathName = this.getFsPath(currentCtx.dir, fullItem);
            const nextCtx = {
              path: desc.path === undefined ? _path.default.join(currentCtx.path, pathName) : desc.path,
              dir: fullItem,
              layout: {
                importpath: layoutpath,
                importname: layoutname
              },
              fallback: null,
              router: true,
              children: [],
              parent: currentCtx
            };
            imports.push({
              name: layoutname,
              path: layoutpath
            });
            currentCtx.children.push(nextCtx);
            traverseDir(relativePath, nextCtx, true);
            isFile = false;
          } else if (!this.findJsFileWithoutExtends(fullItem, 'index')) {
            traverseDir(relativePath, currentCtx);
            isFile = false;
          } else {
            traverseDir(relativePath, currentCtx);
            routeFilePath = _path.default.join(routeFilePath, this.findJsFileWithoutExtends(fullItem, 'index') || '');
          }
        }

        if (!isFile) return;
        const desc = this.getRouteDesc(routeFilePath);

        if (desc.lazy) {
          lazyImports.push({
            name: importname,
            path: importpath
          });
        } else {
          imports.push({
            name: importname,
            path: importpath
          });
        }

        const itemFName = name.replace(/\..+$/, '');

        let routePath = _path.default.join(currentCtx.path, this.getFsPath(currentCtx.dir, fullItem.replace(/\..+$/, ''))); // 转换成 linux 地址


        routePath = routePath.replace(/\\/g, '/');

        if (routePath === '/404') {
          routePath = '*';
        } else {
          routePath = desc.path === undefined ? routePath : desc.path;
        }

        if (itemFName === 'fallback') {
          currentCtx.fallback = {
            importpath,
            importname
          };
        } else {
          currentCtx.children.push(_objectSpread(_objectSpread({}, desc), {}, {
            path: routePath,
            router: false,
            importpath,
            importname
          }));
        }
      });
    };

    traverseDir('', ctx, true);

    if (!_lodash.default.isEqual(ctx, this.preCtx)) {
      this.preCtx = ctx;
      return {
        data: _objectSpread({}, ctx),
        routerLib: this.routerLib,
        imports,
        lazyImports
      };
    } else {
      return undefined;
    }
  }

  preCtx(ctx, preCtx) {
    throw new Error('Method not implemented.');
  } // 生成 import 路径


  getRouteImportPath(relativePath) {
    if (_fs.default.statSync(_path.default.join(this.rootDir, relativePath)).isDirectory()) {
      const entryFileRelativePath = _entities.entryFiles.map(item => {
        const file = _path.default.join(this.rootDir, relativePath, item);

        return _fs.default.existsSync(file) ? _path.default.join(relativePath, item) : null;
      }).filter(Boolean)[0];

      if (!entryFileRelativePath) {
        // throw new Error(`页面文件夹 ${relativePath} 不存在 index.(js|ts|tsx) 文件`);
        return '';
      }
    }

    relativePath = relativePath.replace(/[/\\]?index\.[^/\\]+/i, '') || '.';
    return _path.default.join(this.importRootPath, relativePath).replace(/\..+$/, '').replace(/\\/g, '/');
  } // 生成 import name


  getOneImportName(importpath) {
    return importpath.replace(this.aliasPrefix, '').replace(/^[/\\]|\$|\[|\]|\s/g, '').split(/\/|\\|-|_|\./).map(item => item[0].toUpperCase() + item.slice(1)).join('');
  }

  getRouteDesc(filePath) {
    const desc = {
      exact: true
    };

    const content = _fs.default.readFileSync(filePath, {
      encoding: 'utf8'
    });

    const matched = content.match(/\s*(\/\*((?!(\*\/))[\s\S])*)/);

    if (!matched || !matched[1]) {
      return desc;
    }

    const getValue = name => {
      const result = matched[1].match(new RegExp(`@${name}([ ]*)?([^ \n]*)`));
      if (!result) return undefined;
      if (result[2] === 'false') return false;
      if (result[2] === 'true' || result[2] === '') return true;
      return result[2] || '';
    };

    desc.path = getValue('path');
    desc.exact = getValue('exact');
    desc.lazy = getValue('lazy');
    return desc;
  }

  getFsPath(from, to) {
    let p = _path.default.relative(from, to).split(_path.default.sep).map(name => name.replace(/^\$/, '').replace(/\[(.+)\]/, ':$1')).join(_path.default.sep);

    if (p === 'index') {
      p = '';
    }

    return p;
  }
  /**
   * 给文件排序，带参数和index放到页面底部
   */


  sortFiles(a, b) {
    let levelA = 100;
    let levelB = 100;

    if (/^\$\[.+\]/.test(a)) {
      levelA = 1000;
    }

    if (/^\$\[.+\]/.test(b)) {
      levelB = 1000;
    }

    if (/index\./.test(a)) {
      levelA = 10000;
    }

    if (/index\./.test(b)) {
      levelB = 10000;
    }

    if (/404\./.test(a)) {
      levelA = 100000;
    }

    if (/404\./.test(b)) {
      levelB = 100000;
    }

    return levelA < levelB ? -1 : 0;
  }

}

exports.default = DynamicRoute;