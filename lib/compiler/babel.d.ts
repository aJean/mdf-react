/**
 * @file babel for react
 */
export default function getBabelOpts(opts: any): {
    cacheDirectory: boolean;
    presets: any[][];
    plugins: ((string | {
        version: any;
        absoluteRuntime: string;
        useESModules: boolean;
    })[] | (string | {
        legacy: boolean;
    })[] | (string | {
        loose: boolean;
    })[])[];
};
