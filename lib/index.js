"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
exports.lint = lint;

var _chain = _interopRequireDefault(require("./compiler/chain"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file react 插件集
 */
function _default(api) {
  api.changeUserConfig(config => {
    config.appEntry = `${api.cwd}/.tmp/mdf.tsx`;
    return config;
  });

  const _api$getConfig = api.getConfig(),
        project = _api$getConfig.project;

  const presets = [require.resolve('./route/route'), require.resolve('./history/history'), require.resolve('./mdf/mdf')];

  switch (project.framework) {
    case 'dva':
      presets.push(require.resolve('./dva/dva'));
      break;

    case 'rematch':
      presets.push(require.resolve('./rematch/rematch'));
      break;
  }

  (0, _chain.default)(api);
  api.addRuntimeExports(function () {
    return {
      all: true,
      source: require.resolve('./exports')
    };
  });
  return {
    presets
  };
}
/**
 * es-lint config
 */


function lint(opts) {
  Object.assign(opts.settings, {
    react: {
      version: 'detect'
    }
  });
  opts.plugins.push('react', 'react-hooks');
  Object.assign(opts.rules, {
    'no-restricted-properties': ['error', {
      object: 'require',
      property: 'ensure',
      message: 'Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting'
    }, {
      object: 'System',
      property: 'import',
      message: 'Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting'
    }],
    'react-hooks/exhaustive-deps': 'warn',
    // https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules
    'react/forbid-foreign-prop-types': ['warn', {
      allowInPropTypes: true
    }],
    'react/jsx-no-comment-textnodes': 'warn',
    'react/jsx-no-duplicate-props': 'warn',
    'react/jsx-no-target-blank': 'warn',
    'react/jsx-no-undef': 'error',
    'react/jsx-pascal-case': ['warn', {
      allowAllCaps: true,
      ignore: []
    }],
    'react/jsx-uses-react': 'warn',
    'react/jsx-uses-vars': 'warn',
    'react/no-danger-with-children': 'warn',
    // Disabled because of undesirable warnings
    // See https://github.com/facebook/create-react-app/issues/5204 for
    // blockers until its re-enabled
    // 'react/no-deprecated': 'warn',
    'react/no-direct-mutation-state': 'warn',
    'react/no-is-mounted': 'warn',
    'react/no-typos': 'error',
    'react/react-in-jsx-scope': 'error',
    'react/require-render-return': 'error',
    'react/style-prop-object': 'warn',
    'react/jsx-curly-brace-presence': ['error', {
      props: 'never',
      children: 'never'
    }],
    'react/sort-comp': ['error'],
    'jsx-quotes': ['error', 'prefer-double']
  });
  return opts;
}