import { {{{ creator }}} } from '{{{ runtimePath }}}';

/**
 * @file router history 配置
 */

let options: any = {{{ options }}};

if ((<any>window).routerBase) {
  options.basename = (<any>window).routerBase;
}

let history: any = {{{ creator }}}(options);

export { history };

export function createHistory(hotReload = false)  {
  if (!hotReload) {
    history = {{{ creator }}}(options);
  }

  return history;
};
