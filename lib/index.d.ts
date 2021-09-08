import { IApi } from '@mdfjs/types';
/**
 * @file react 插件集
 */
export default function (api: IApi): {
    presets: string[];
};
/**
 * es-lint config
 */
export declare function lint(opts: any): any;
