import { createModel as createRematchModel } from '@rematch/core';

/**
 * @file rematch exports
 */

export { RematchDispatch, RematchRootState, ModelEffect, ModelHook } from '@rematch/core';
export { Provider, connect, useSelector, useDispatch } from 'react-redux';

export const createModel = createRematchModel();
