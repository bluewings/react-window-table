const { colors } = require('tailwindcss/defaultConfig.stub');
const rules = require('./config/webpack.rules');

const modifyBundlerConfig = (config) => {
  config.resolve.extensions.push('.pug');
  config.module.rules = [...config.module.rules, ...rules()];
  return config;
};

const themeConfig = {
  colors: {
    primary: colors.blue,
    link: colors.blue,
  },
  fonts: {
    display: 'Roboto,-apple-system,BlinkMacSystemFont,"Helvetica Neue",Helvetica,sans-serif',
    ui: 'Roboto,-apple-system,BlinkMacSystemFont,"Helvetica Neue",Helvetica,sans-serif',
    mono: 'source-code-pro,Menlo,Monaco,Consolas,"Courier New",monospace',
  },
  showPlaygroundEditor: false,
};

const htmlContext = {
  head: {
    links: [
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css?family=Roboto+Mono|Roboto:400,500,700',
      },
    ],
  },
};

export default {
  modifyBundlerConfig,
  themeConfig,
  htmlContext,
  typescript: true,
  dest: 'docs',
  hashRouter: true,
};
