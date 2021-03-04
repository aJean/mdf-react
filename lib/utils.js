"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.genRootPath = genRootPath;
exports.genRoutesPath = genRoutesPath;
exports.genModelsPath = genModelsPath;

/**
 * @file utils
 */

/**
 * 工程模块需要自己适配路径规范
 */
function genRootPath(api) {
  const _api$getConfig = api.getConfig(),
        project = _api$getConfig.project;

  switch (project.type) {
    case 'hybrid':
      return 'src/client';

    default:
      return 'src';
  }
}

function genRoutesPath(api) {
  return `${genRootPath(api)}/pages`;
}

function genModelsPath(api) {
  return `${genRootPath(api)}/models`;
}