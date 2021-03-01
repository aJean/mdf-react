import { match, Location, LocationState, History } from 'mdf';
import { EffectsCommandMap } from '{{{ dvaPath }}}';

/**
 * @file plugins-dva 声明导出
 */

export interface Action<T = any> {
  type: T;
  payload: any;
}

export type Reducer<S = any, A extends Action = Action> = (
  state: S | undefined,
  action: A
) => S;

export type ImmerReducer<S = any, A extends Action = Action> = (
  state: S,
  action: A
) => void;

export type Effect = (
  action: Action,
  effects: EffectsCommandMap,
) => void;

export type Dispatch = <P = any, C = (payload: P) => void>(action: {
  type: string;
  payload?: P;
  callback?: C;
  [key: string]: any;
}) => any;

export interface Loading {
  global: boolean;
  effects: { [key: string]: boolean | undefined };
  models: {
    [key: string]: any;
  };
}

export interface Model<S = any> {
  namespace: string;
  state: S;
  effects: {
    [key: string]: Effect;
  },
  reducers: {
    [key: string]: Reducer<S>;
  }
}

export interface ImmerModel<S = any> {
  namespace: string;
  state: S;
  effects: {
    [key: string]: Effect;
  },
  reducers: {
    [key: string]: ImmerReducer<S>;
  }
}

export interface ConnectProps<P extends { [K in keyof P]?: string } = {}, S = LocationState> {
  dispatch?: Dispatch;
  match?: match<P>;
  location: Location<S>;
  history: History;
  route: any;
}

export { connect, useDispatch, useStore, useSelector } from '{{{ dvaPath }}}';