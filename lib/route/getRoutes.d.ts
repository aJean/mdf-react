/**
 * @file 动态路由
 */
export default class DynamicRoute {
    rootDir: string;
    aliasPrefix: string;
    distFile: string;
    routeFileTag: string;
    routerLib: string;
    importRootPath: string;
    constructor(opts: any);
    findJsFileWithoutExtends(dir: string, name: string): string | null;
    getRoutes(): {
        data: any;
        routerLib: string;
        imports: any;
        lazyImports: any;
    } | undefined;
    preCtx(ctx: {
        path: string;
        dir: any;
        layout: null;
        fallback: null;
        router: boolean;
        children: never[];
    }, preCtx: any): void;
    getRouteImportPath(relativePath: string): string;
    getOneImportName(importpath: string): string;
    getRouteDesc(filePath: string): any;
    getFsPath(from: string, to: string): string;
    /**
     * 给文件排序，带参数和index放到页面底部
     */
    sortFiles(a: string, b: string): 0 | -1;
}
