import { IApi } from '@mdfjs/types';
import fs from 'fs';
import Lodash from 'lodash';

/**
 * @file 解析 ast 查找 model name
 *       支持验证 schema，确保模块可用
 */

// 检测 model 语法
export function checkModel(file: string, api: IApi) {
  const babel = require('@babel/core');
  const ast = babel.parse(api.getFile(file), {
    // @see https://babeljs.io/docs/en/options#filename
    filename: file,
    presets: [require('@babel/preset-typescript')],
  });

  let hasDefault = false;
  let error = null;

  babel.traverse(ast, {
    ExportDefaultDeclaration(path: any) {
      hasDefault = true;

      const { node } = path;

      switch (node.declaration.type) {
        case 'Identifier':
          const name = node.declaration.name;
          ast.program.body.forEach((el: any) => {
            if (el.type === 'VariableDeclaration') {
              if (el.declarations[0].id.name === name) {
                error = isValid(el.declarations[0].init, file);
              }
            }
          });

          break;
        case 'ObjectExpression':
          error = isValid(node.declaration, file);
          break;
      }
    },
  });

  if (!hasDefault) {
    error = { msg: `${file} do not have default exports`, type: 'no exports' };
  }

  return error;
}

/**
 * 检查导出属性是否符合规范
 */
function isValid(node: any, path: string) {
  let hasState = false;
  const error = { msg: '', type: 'exports invalid' };

  try {
    node.properties.forEach((property: any) => {
      if (property.key.name === 'state') {
        hasState = true;
      }
    });
  } catch (e) {
    error.msg = e.message;
    return error;
  }

  if (!hasState) {
    error.msg = `${path} is missing the following propertie state`;
    return error;
  }

  return null;
}

/**
 * 分析 ast 获取 model name
 */
export const getModelName = (file: string) => {
  const babel = require('@babel/core');
  const t = require('@babel/types');
  const tree = babel.parse(fs.readFileSync(file).toString(), {});

  let modelName = undefined;

  babel.traverse(tree, {
    ObjectExpression: {
      enter(path: any) {
        // 包含 name 和 state 则可以认为是 model 声明
        if (
          Lodash.intersection(
            path.node.properties
              .filter((item: any) => item.type === 'ObjectProperty')
              .map((item: any) => item.key.name),
            ['name', 'state'],
          ).length === 2
        ) {
          let nameNode: any = path.node.properties.find((item: any) => item.key.name === 'name');
          modelName = nameNode.value.value;

          if (t.isTSAsExpression(nameNode.value)) {
            modelName = nameNode.value.expression.value;
          }

          if (t.isIdentifier(nameNode.value)) {
            path.traverse({
              ObjectProperty: {
                enter(path: any) {
                  let current = nameNode.value;
                  path.isStringLiteral;
                  if (path.node.key.name === 'name') {
                    while (t.isIdentifier(current)) {
                      const sPath = path.scope.getBinding(current.name).path;
                      if (t.isStringLiteral(sPath.node.init)) {
                        modelName = sPath.node.init.value;
                        break;
                      } else if (t.isIdentifier(sPath.node.init)) {
                        current = sPath.node.init;
                      } else {
                        throw new Error(
                          `无法从节点解析出 ModelName:\n ${JSON.stringify(sPath.node, null, 2)}`,
                        );
                      }
                    }
                  }
                },
              },
            });
          }
        }
      },
    },
  });

  return modelName;
};

export const getModelNameLegacy = (file: string) => {
  const content = fs.readFileSync(file).toString();
  const matched = content.match(/name\s*:\s*['"]([^'"]+)['"]/);

  if (matched) {
    return matched[1];
  }

  return null;
};
