import pugAsJsx from 'rollup-plugin-pug-as-jsx';
import typescript from 'rollup-plugin-typescript2';
import babel from 'rollup-plugin-babel';
import postcss from 'rollup-plugin-postcss';
import { uglify } from 'rollup-plugin-uglify';
import tailwindcss from 'tailwindcss';
import postcssFlexbugsFixes from 'postcss-flexbugs-fixes';
import postcssPresetEnv from 'postcss-preset-env';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const pkg = require('./package.json');

const entry = 'src/core';

const external = Object.keys(pkg.dependencies);

const rollupConfig = {
  input: `${entry}/index.ts`,
  plugins: [
    pugAsJsx({
      resolve: {
        classnames: 'cx',
      },
    }),
    typescript({
      // https://github.com/ezolenko/rollup-plugin-typescript2
      clean: true,
      objectHashIgnoreUnknownHack: true,
      useTsconfigDeclarationDir: true,
    }),
    babel({
      runtimeHelpers: true,
      plugins: ['@babel/transform-runtime'],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
    postcss({
      plugins: [
        tailwindcss(),
        postcssFlexbugsFixes,
        postcssPresetEnv({
          autoprefixer: {
            flexbox: 'no-2009',
          },
          stage: 3,
        }),
      ],
    }),
    nodeResolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
    commonjs(),
  ],
  external,
};

const cjsConfig = {
  ...rollupConfig,
  output: {
    file: pkg.main,
    format: 'cjs',
    sourcemap: true,
  },
};

const esConfig = {
  ...rollupConfig,
  output: {
    file: pkg.module,
    format: 'es',
    sourcemap: true,
  },
};

const amdPlugins = rollupConfig.plugins.map((plugin) =>
  plugin.name !== 'babel'
    ? plugin
    : babel({
        presets: ['@babel/preset-env'],
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.pug'],
      }),
);

const amdConfig = {
  ...rollupConfig,
  output: {
    file: pkg.browser,
    format: 'amd',
    sourcemap: true,
    strict: false,
  },
  plugins: amdPlugins,
  external: false,
};

const amdMinConfig = {
  ...rollupConfig,
  output: {
    file: pkg.browser.replace(/\.js$/, '.min.js'),
    format: 'amd',
    sourcemap: true,
    strict: false,
  },
  plugins: [...amdPlugins, uglify()],
  external: false,
};

export default [
  cjsConfig,
  esConfig,
  amdConfig,
  amdMinConfig,
];
