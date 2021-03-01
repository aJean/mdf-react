import React, { Suspense } from 'react';
import { Route, Switch } from '{{routerLib}}';
{{#imports}}
import {{{name}}} from '{{{path}}}';
{{/imports}}

/**
 * @file 此文件由 `routes.plugin` 自动生成，请不要手动修改。
 */

{{#lazyImports}}
const {{name}} = React.lazy(()=>
import(
  /* webpackChunkName: "{{name}}" */
  '{{{path}}}'
));
{{/lazyImports}}

export default function Routes() {
  return (
    <>
      {{#data}}
      {{> item}}
      {{/data}}
    </>
  );
}