import { match, Location, LocationState, History } from 'mdf';
import { Models, RematchDispatch, RematchRootState } from '{{{ rematchPath }}}';
{{#models}}
import {{{ name }}} from '{{{ importPath }}}';
{{/models}}

/**
 * @file 此文件由 `rematch/inject` 自动生成，请不要手动修改。
 */

declare module 'mdf' {
  interface RootModel extends Models<RootModel> {
    {{#models}}
      {{{ name }}}: typeof {{{ name }}};
    {{/models}}
  }

  interface ConnectedProps<P extends { [K in keyof P]?: string } = {}, S = LocationState> {
    dispatch: RematchDispatch<RootModel>;
    match: match<P>;
    location: Location<S>;
    history: History;
    route: any;
  }

  type Dispatch = RematchDispatch<RootModel>;

  type RootState = RematchRootState<RootModel>;
}