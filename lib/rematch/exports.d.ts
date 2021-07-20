/**
 * @file rematch exports
 */
export { RematchDispatch, RematchRootState, ModelEffect, ModelHook } from '@rematch/core';
export { Provider, connect, useSelector, useDispatch } from 'react-redux';
export declare const createModel: <R extends import("@rematch/core").ModelReducers<S>, BR extends import("redux").Reducer<BS, import("redux").AnyAction>, E extends import("@rematch/core").ModelEffects<import("@rematch/core").Models<unknown>> | import("@rematch/core").ModelEffectsCreator<import("@rematch/core").Models<unknown>>, S, BS = S>(mo: {
    name?: string | undefined;
    state: S;
    reducers?: R | undefined;
    baseReducer?: BR | undefined;
    effects?: E | undefined;
}) => {
    name?: string | undefined;
    state: S;
    reducers: R;
    baseReducer: BR;
    effects: E;
};
