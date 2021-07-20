import { IApi } from '@mdfjs/types';
/**
 * @file 自动注入 model 插件
 */
export declare type InjectOpts = {
    api: IApi;
    rematchPath: string;
    modelPath: string;
};
export declare function inject(opts: InjectOpts): void;
