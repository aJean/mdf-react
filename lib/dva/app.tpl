import React from 'react';
import dva, { DvaOption } from '{{{ dvaPath }}}';
// @ts-ignore
import createLoading from '{{{ loadingPath }}}';
// @ts-ignore
import createImmer from '{{{ immerPath }}}';
{{#persistPath}}
// @ts-ignore
import { persistStore, persistReducer } from '{{{ persistPath }}}';
// @ts-ignore
import storage from '{{{ persistPath }}}/es/storage';
{{/persistPath}}
import { plugin, PluginType } from 'mdf';

/**
 * @file plugin-dva-app
 */

// 兼容 fundamental
interface AppOpts extends DvaOption {
  rootEl: any;
}

{{#persistPath}}
// 接入 redux-persist
const persistEnhancer = function(createStore: any) {
  return function (reducer: any, initialState: any, enhancer: any) {
    const persistConfig = {
      timeout: 1000,
      key: 'root',
      storage,
    };
    const store = createStore(persistReducer(persistConfig, reducer), initialState, enhancer);
    const persist = persistStore(store, null);

    return { persist, ...store };
  };
}
{{/persistPath}}

let app: any;
export default function(opts: AppOpts) {
  const config = plugin.invoke({
    key: 'appOpts',
    type: PluginType.modify,
    initValue: opts,
  });

  app = dva({
    ...config,
    {{#persistPath}}
    extraEnhancers: [persistEnhancer],
    {{/persistPath}}
  });

  app.getAppElement = () => plugin.invoke({
    key: 'appElement',
    type: PluginType.modify,
    initValue: React.createElement(RootElement)
  });

  // loading 插件
  app.use(createLoading());
  // immr 插件
  app.use(createImmer());

  // 这里可以注册 modles
  {{{ RegisterModels }}}

  return app;
}

export class RootElement extends React.Component {
  componentWillUnmount() {
    app._models.forEach((model:any) => {
      app.unmodel(model.namespace);
    });
    app._models = [];
    // 释放 app，for gc，immer 场景 app 是 read-only 的，这里 try catch 一下
    try {
      app = null;
    } catch(e) {
      console.error(e);
    }
  }

  render() {
    // 记得要执行 app.router 注入 routes
    return app.start()();
  }
}