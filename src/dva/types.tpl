import { Model } from 'mdf';
{{#models}}
import {{{ name }}}Model from '{{{ importPath }}}';
{{/models}}

/**
 * @file 此文件由 `dva/inject` 自动生成，请不要手动修改。
 */

type ExtractLoading<T extends Record<string, Model>> = {
  global: boolean;
  models: {
    [K in keyof T]: boolean;
  };
  effects: {
    [any]: boolean;
  };
};

{{#models}}
type {{{ name }}} = typeof {{{ name }}}Model;
{{/models}}

declare module 'mdf' {
  interface State {
    {{#models}}
      {{{ name }}}: {{{ name }}}['state'];
    {{/models}}
    
    {{#loading}}
    loading: ExtractLoading<{
      {{#models}}
      {{{ name }}}
      {{/models}}
    }>;
    {{/loading}}
  }
}
