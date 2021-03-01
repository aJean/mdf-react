import fs from 'fs';
import path from 'path';
import Loadsh from 'lodash';
import { entryFiles, reserveFiles, rext, rdir } from './entities';

/**
 * @file 动态路由
 */

export default class DynamicRoute {
  rootDir: string;
  aliasPrefix: string;
  distFile: string;
  routeFileTag: string;
  routerLib: string;
  importRootPath: string;

  constructor(opts: any) {
    this.rootDir = opts.rootDir || '';
    this.aliasPrefix = opts.aliasPrefix || '@';
    this.distFile = opts.distFile || path.join('.tmp/routes.tsx');
    this.routeFileTag = opts.routeFileTag || '';
    this.routerLib = opts.routerLib || 'mdf';
    this.importRootPath = this.aliasPrefix + '/pages';
    this.getRoutes = Loadsh.debounce(this.getRoutes, 600, { leading: true, trailing: true });
  }

  findJsFileWithoutExtends(dir: string, name: string) {
    const result = ['.jsx', '.js', '.tsx', '.ts']
      .map((item) => `${name}${item}`)
      .find((item) => fs.existsSync(path.join(dir, item)));

    if (result) {
      return result;
    }

    return null;
  }

  getRoutes() {
    const ctx: any = {
      path: '/',
      dir: this.rootDir,
      layout: null,
      fallback: null,
      router: true,
      children: [],
    };
    const imports: any = [];
    const lazyImports: any = [];

    // 根layout
    const rootLayoutFile = this.findJsFileWithoutExtends(this.rootDir, 'layout');
    if (rootLayoutFile) {
      ctx.layout = { importname: 'Layout', importpath: this.importRootPath + '/layout' };
      imports.push({ name: ctx.layout.importname, path: ctx.layout.importpath });
    }

    const traverseDir = (dir: string, currentCtx: any, handleIndex = false) => {
      const fullDir = path.join(this.rootDir, dir);

      fs.readdirSync(fullDir)
        .sort(this.sortFiles)
        .filter(item => !(/(^|\/)\.[^\/\.]/g).test(item))
        .forEach((item) => {
          if (
            !(
              item.startsWith(this.routeFileTag) ||
              reserveFiles.some((fitem) => {
                if (item === fitem) {
                  return true;
                }
                return false;
              })
            )
          ) {
            return;
          }

          let name = item.replace(/\..+$/, '');

          // layout 在外面处理，隔离图片样式文件
          if ((!handleIndex && name === 'index') || name === 'layout' || rext.test(item)) {
            return;
          }
         
          const fullItem = path.join(fullDir, item);
          const relativePath = path.join(dir, item);

          if (rdir.test(fullItem)) {
            return;
          }

          const stat = fs.statSync(fullItem);
          const importpath = this.getRouteImportPath(relativePath);
          const importname = importpath ? this.getOneImportName(importpath) : '';
          let routeFilePath = fullItem;
          let isFile = true;

          // 递归查找下层目录
          if (stat.isDirectory()) {
            const layoutFile = this.findJsFileWithoutExtends(fullItem, 'layout');
            // 进目录前先找 layout
            if (layoutFile) {
              const desc: any = this.getRouteDesc(
                path.join(fullItem, this.findJsFileWithoutExtends(fullItem, 'layout') || ''),
              );
              const layoutpath = importpath + '/layout';
              const layoutname = this.getOneImportName(importpath + '/layout');
              const pathName = this.getFsPath(currentCtx.dir, fullItem);

              const nextCtx = {
                path: desc.path === undefined ? path.join(currentCtx.path, pathName) : desc.path,
                dir: fullItem,
                layout: {
                  importpath: layoutpath,
                  importname: layoutname,
                },
                fallback: null,
                router: true,
                children: [],
                parent: currentCtx,
              };

              imports.push({
                name: layoutname,
                path: layoutpath,
              });

              currentCtx.children.push(nextCtx);
              traverseDir(relativePath, nextCtx, true);
              isFile = false;
            } else if (!this.findJsFileWithoutExtends(fullItem, 'index')) {
              traverseDir(relativePath, currentCtx);
              isFile = false;
            } else {
              traverseDir(relativePath, currentCtx);
              routeFilePath = path.join(
                routeFilePath,
                this.findJsFileWithoutExtends(fullItem, 'index') || '',
              );
            }
          }

          if (!isFile) return;

          const desc: any = this.getRouteDesc(routeFilePath);

          if (desc.lazy) {
            lazyImports.push({
              name: importname,
              path: importpath,
            });
          } else {
            imports.push({
              name: importname,
              path: importpath,
            });
          }

          const itemFName = name.replace(/\..+$/, '');

          let routePath = path.join(
            currentCtx.path,
            this.getFsPath(currentCtx.dir, fullItem.replace(/\..+$/, '')),
          );

          // 转换成 linux 地址
          routePath = routePath.replace(/\\/g, '/');

          if (routePath === '/404') {
            routePath = '*';
          } else {
            routePath = desc.path === undefined ? routePath : desc.path;
          }

          if (itemFName === 'fallback') {
            currentCtx.fallback = {
              importpath,
              importname,
            };
          } else {
            currentCtx.children.push({
              ...desc,
              path: routePath,
              router: false,
              importpath,
              importname,
            });
          }
        });
    };

    traverseDir('', ctx, true);

    if (!Loadsh.isEqual(ctx, this.preCtx)) {
      this.preCtx = ctx;
      return { data: { ...ctx }, routerLib: this.routerLib, imports, lazyImports };
    } else {
      return undefined;
    }
  }

  preCtx(
    ctx: {
      path: string;
      dir: any;
      layout: null;
      fallback: null;
      router: boolean;
      children: never[];
    },
    preCtx: any,
  ) {
    throw new Error('Method not implemented.');
  }

  // 生成 import 路径
  getRouteImportPath(relativePath: string) {
    if (fs.statSync(path.join(this.rootDir, relativePath)).isDirectory()) {
      const entryFileRelativePath = entryFiles
        .map((item) => {
          const file = path.join(this.rootDir, relativePath, item);
          return fs.existsSync(file) ? path.join(relativePath, item) : null;
        })
        .filter(Boolean)[0];

      if (!entryFileRelativePath) {
        // throw new Error(`页面文件夹 ${relativePath} 不存在 index.(js|ts|tsx) 文件`);
        return '';
      }
    }

    relativePath = relativePath.replace(/[/\\]?index\.[^/\\]+/i, '') || '.';

    return path.join(this.importRootPath, relativePath).replace(/\..+$/, '').replace(/\\/g, '/');
  }

  // 生成 import name
  getOneImportName(importpath: string) {
    return importpath
      .replace(this.aliasPrefix, '')
      .replace(/^[/\\]|\$|\[|\]|\s/g, '')
      .split(/\/|\\|-|_|\./)
      .map((item) => item[0].toUpperCase() + item.slice(1))
      .join('');
  }

  getRouteDesc(filePath: string) {
    const desc: any = {
      exact: true,
    };

    const content = fs.readFileSync(filePath, { encoding: 'utf8' });
    const matched = content.match(/\s*(\/\*((?!(\*\/))[\s\S])*)/);

    if (!matched || !matched[1]) {
      return desc;
    }

    const getValue = (name: string) => {
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

  getFsPath(from: string, to: string) {
    let p = path
      .relative(from, to)
      .split(path.sep)
      .map((name) => name.replace(/^\$/, '').replace(/\[(.+)\]/, ':$1'))
      .join(path.sep);

    if (p === 'index') {
      p = '';
    }
    return p;
  }

  /**
   * 给文件排序，带参数和index放到页面底部
   */
  sortFiles(a: string, b: string) {
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
