{{{ importsPolyfill }}}
{{{ importsAhead }}}
import React from 'react';
import * as ReactDOM from 'react-dom';
import { Router, PluginType } from 'mdf';
import { plugin, config } from './plugins/plugin';
import { history } from './history';
{{#useDva}}
import createMdfApp from './plugins-dva/app';
{{/useDva}}
{{^useDva}}
import createMdfApp from './plugins-fundamental/app';
{{/useDva}}
{{{ importsBehind }}}

/**
 * @file mdf-js 入口文件
 */

const rootEl = document.getElementById('root') || document.body;
const app = createMdfApp({ rootEl, history });

function initRender() {
  const Routes = require('./routes').default;
  app.router(() => (
    <Router history={history}>
      <Routes />
    </Router>
  ));
  
  ReactDOM.render(app.getAppElement!(), rootEl);
}

// 组合执行 render
const renderClient = plugin.invoke({
  key: 'render',
  type: PluginType.compose,
  initValue: initRender,
});

{{{ globalCode }}}

plugin.invoke({ key: 'beforeRender', type: PluginType.event, args: [config, app] });
renderClient();

// hot module replacement
// @ts-ignore
if (module.hot) {
  // @ts-ignore
  module.hot.accept('./routes', () => {
    renderClient();
  });
}