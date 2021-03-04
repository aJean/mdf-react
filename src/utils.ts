/**
 * @file utils
 */


/**
 * 工程模块需要自己适配路径规范
 */
export function genRootPath(api: any) {
  const { project } = api.getConfig();

  switch (project.type) {
    case 'hybrid':
      return 'src/client';
    default:
      return 'src';
  }
}

export function genRoutesPath(api: any) {
  return `${genRootPath(api)}/pages`;
}

export function genModelsPath(api: any) {
  return `${genRootPath(api)}/models`;
}
