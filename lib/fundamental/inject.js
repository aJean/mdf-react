"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _path = require("path");

var _utils = require("@mdfjs/utils");

var _parse = require("../compiler/parse");

/**
 * @file 目前约定 model 只放在 src/models 里面，文件名作为 namespace
 */
function _default(api, modelsPath) {
  const paths = api.paths,
        Mustache = api.Mustache;

  const _api$getConfig = api.getConfig(),
        isDev = _api$getConfig.isDev;

  const matches = (0, _utils.globFind)(`${modelsPath}/**/*.{ts,js,tsx,jsx}`);
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
  }).filter(Boolean); // 约定文件名作为 model name

  const RegisterModels = models.map(model => {
    const absFilePath = model.absFilePath,
          name = model.name;
    const modelTpl = `app.model({ ...require('${absFilePath}').default, name: '${name}' });`;
    return modelTpl.trim();
  }).join('\r\n'); // 写入 app

  const tpl = api.getFile((0, _path.join)(__dirname, './app.tpl'));
  const content = Mustache.render(tpl, {
    RegisterModels
  });
  api.writeFile(`${paths.absTmpPath}/plugins-fundamental/app.ts`, (0, _utils.prettierFormat)(content)); // 写入 typings

  const typesTpl = api.getFile((0, _path.join)(__dirname, './types.tpl'));
  const typesContent = Mustache.render(typesTpl, {
    models,
    loading: true
  });
  api.writeFile(`${paths.absTmpPath}/plugins-fundamental/type.d.ts`, (0, _utils.prettierFormat)(typesContent));
}