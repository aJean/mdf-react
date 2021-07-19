import React from 'react';
import { init } from '{{{ rematchPath }}}';
import { plugin, PluginType } from 'mdf';
{{#models}}
import {{{ name }}} from '{{{ importPath }}}';
{{/models}}

/**
 * @file 集成业务框架 - rematch
 */

const { Provider } = require('{{{ reduxPath }}}');

export default function (opts: any) {
  const config = plugin.invoke({
    key: 'appOpts',
    type: PluginType.modify,
    initValue: opts,
  });

  const app = {
    getAppElement() {
      return plugin.invoke({
        key: 'appElement',
        type: PluginType.modify,
        initValue: React.createElement(RootElement, { app }),
      });
    },

    router(router: any) {
      this.$router = router;
    },

    create() {
      return React.createElement(
        Provider,
        {
          store: init({ models: {{{ initModels }}} }),
        },
        this.$router(),
      );
    },
  };

  return app;
}

export class RootElement extends React.Component<{ app: any }> {
  render() {
    // 记得要执行 app.router 注入 routes
    return this.props.app.create();
  }
}