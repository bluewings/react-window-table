const { getIn, setIn } = require('immutable');
const rules = require('./webpack.rules');

module.exports = (paths) => ({
  // Customize webpack.config.js
  'resolve.modules': {
    $push: ['shared'],
  },

  // path in webpack.config
  'module.rules...oneOf': {
    // Apply transform-commonjs-es2015-modules to js files.
    // https://www.npmjs.com/package/babel-plugin-transform-commonjs-es2015-modules
    $aggregate: [
      {
        $match(rule) {
          const { include, test = {} } = rule;
          return include && typeof test.test === 'function' && test.test('app.js');
        },
        $update(rule) {
          return setIn(
            rule,
            ['options', 'plugins'],
            [
              ...(getIn(rule, ['options', 'plugins']) || []),
              require.resolve('babel-plugin-transform-commonjs-es2015-modules'),
            ],
          );
        },
      },
    ],

    $unshift: rules(paths, {
      babel: (loader) => {
        return {
          ...loader,
          options: {
            ...loader.options,
            compact: true,
          },
        };
      },
      css: (loader) => {
        return {
          ...loader,
          options: {
            ...loader.options,
            sourceMap: false,
            localIdentName: '[hash:base64:5]',
          },
        };
      },
    }),
  },
});
