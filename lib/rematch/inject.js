"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _path = require("path");

var _utils = require("@mdfjs/utils");

var _parse = require("../fundamental/parse");

/**
 * @file 自动注入 model 插件
 */
function _default(api, rematchPath, modelsPath) {
  const paths = api.paths,
        Mustache = api.Mustache;

  const _api$getConfig = api.getConfig(),
        isDev = _api$getConfig.isDev,
        project = _api$getConfig.project;

  const matches = (0, _utils.globFind)(`${modelsPath}/**/*.{ts,js,tsx,jsx}`).filter(path => !/dva_/.test(path));
  const models = matches.map(file => {
    const error = (0, _parse.checkModel)(file, api);

    if (error) {
      const info = [['error: ', 'red'], ` ${error.msg}`];

      if (isDev) {
        api.addProcessDone(() => (0, _utils.chalkPrints)(info));
      } else {
        (0, _utils.chalkPrints)(info);
        process.exit(1);
      }
    }

    const modelName = (0, _path.basename)(file, (0, _path.extname)(file));
    const absFilePath = (0, _path.resolve)(file);

    if (!modelName) {
      return (0, _utils.chalkPrints)([['error: ', 'red'], ` 解析${file}失败`]);
    }

    return {
      name: modelName,
      file,
      absFilePath,
      importPath: absFilePath.replace('.ts', '')
    };
  }).filter(Boolean); // 写入 app

  const initModels = `{${models.map(model => `${model.name}`.trim()).join(',')}}`;
  const tpl = api.getFile((0, _path.join)(__dirname, './app.tpl'));
  const content = Mustache.render(tpl, {
    models,
    initModels,
    rematchPath,
    reduxPath: (0, _path.dirname)(require.resolve('react-redux/package.json'))
  });
  api.writeFile(`${paths.absTmpPath}/plugins-rematch/app.ts`, (0, _utils.prettierFormat)(content)); // 写入 typings

  const typesTpl = api.getFile((0, _path.join)(__dirname, './types.tpl'));
  const typesContent = Mustache.render(typesTpl, {
    models,
    rematchPath
  });
  api.writeFile(`${paths.absTmpPath}/plugins-rematch/type.d.ts`, (0, _utils.prettierFormat)(typesContent));
}