import { IApi } from '@mdfjs/types';
/**
 * @file 解析 ast 查找 model name
 *       支持验证 schema，确保模块可用
 */
export declare function checkModel(file: string, api: IApi): {
    msg: string;
    type: string;
} | null;
/**
 * 分析 ast 获取 model name
 */
export declare const getModelName: (file: string) => undefined;
export declare const getModelNameLegacy: (file: string) => string | null;
