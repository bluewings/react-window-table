const { setIn } = require('immutable');
const tailwindcss = require('tailwindcss');
const postcssFlexbugsFixes = require('postcss-flexbugs-fixes');
const postcssPresetEnv = require('postcss-preset-env');

module.exports = (paths, overrides = {}) => {
  const babel = {
    loader: require.resolve('babel-loader'),
    options: { presets: ['react-app'] },
  };

  const pugAsJsx = {
    loader: require.resolve('pug-as-jsx-loader'),
    options: {
      resolve: {
        classnames: 'cx',
      },
      autoUpdateJsFile: true,
    },
  };

  const style = { loader: require.resolve('style-loader') };

  const css = {
    loader: require.resolve('css-loader'),
    options: {
      importLoaders: 1,
      sourceMap: true,
      modules: true,
      localIdentName: '[name]-[local]-[hash:base64:5]',
    },
  };

  const postcss = {
    loader: require.resolve('postcss-loader'),
    options: {
      // Necessary for external CSS imports to work
      // https://github.com/facebookincubator/create-react-app/issues/2677
      ident: 'postcss',
      plugins: () => [
        tailwindcss(),
        postcssFlexbugsFixes,
        postcssPresetEnv({ autoprefixer: { flexbox: 'no-2009' }, stage: 3 }),
      ],
    },
  };

  const sass = { loader: require.resolve('sass-loader') };

  const loaders = Object.entries(overrides || {}).reduce(
    (accum, [k, v]) => (accum[k] && typeof v === 'function' ? { ...accum, [k]: v(accum[k]) } : accum),
    { babel, pugAsJsx, style, css, postcss, sass },
  );

  return [
    // Process pug as jsx.
    {
      test: /\.pug$/,
      include: /(\/src\/|\/documentation\/)/,
      use: [loaders.babel, loaders.pugAsJsx],
    },

    // Process application css|scss.
    {
      test: /\.module\.(css|scss)$/,
      include: /(\/src\/|\/documentation\/)/,
      use: [loaders.style, loaders.css, loaders.postcss, loaders.sass],
    },

    // Process any css|scss outside of the app.
    {
      test: (filename) => filename.match(/\.(css|scss)$/) && !filename.match(/\.module\.(css|scss)$/),
      include: /(\/src\/|\/documentation\/|\/node_modules\/)/,
      use: [loaders.style, setIn(loaders.css, ['options', 'localIdentName'], '[local]'), loaders.postcss, loaders.sass],
    },

    // Process yaml files.
    {
      test: /\.(yml|yaml)$/,
      exclude: /node_modules/,
      use: [require.resolve('json-loader'), require.resolve('yaml-loader')],
    },
  ];
};
