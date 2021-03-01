"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.genRootPath = genRootPath;
exports.genRoutesPath = genRoutesPath;
exports.genModelsPath = genModelsPath;

/**
 * @file 考虑到 path 会因为不同类型的项目而变化
 */
function genRootPath(api) {
  const _api$getConfig = api.getConfig(),
        framework = _api$getConfig.framework;

  return framework.root || 'src';
}

function genRoutesPath(api) {
  return `${genRootPath(api)}/pages`;
}

function genModelsPath(api) {
  return `${genRootPath(api)}/models`;
}