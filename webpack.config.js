const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const pkg = require('./package.json');
const merge = require('webpack-merge');
const validate = require('webpack-validator');
const parts = require('./libs/parts');




const PATHS = {
  app: path.join(__dirname, 'app'),
  style: [
          path.join(__dirname, 'node_modules', 'purecss'),
          path.join(__dirname, 'app', 'main.css')
        ],
  build: path.join(__dirname, 'build')
};

const common = {
  entry: {
    app: PATHS.app,
  },
  output: {
    path: PATHS.build,
    filename: '[name].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Webpack demo'
    })
  ]
};

var config;


switch(process.env.npm_lifecycle_event) {
  case 'build':
    config = merge(common,
      {
        devtool: 'source-map',
        output: {
          path: PATHS.build,
          filename: '[name].[chunkhash].js',
          chunkFilename: '[chunkhash].js'
        }
      },
      parts.clean(PATHS.build),
      parts.setFreeVariable(
        'process.env.NODE_ENV',
        'production'
      ),

      parts.extractBundle({
          name: 'vender',
          entries: Object.keys(pkg.dependencies)
      }),
      parts.minify(),
      parts.extractCSS(PATHS.style),
      parts.purifyCSS([PATHS.app])
    );
    break;
  default:
    config = merge(
      common,
      parts.setupCSS(PATHS.app),
      {
        devtool: 'eval-source-map'
      },
      parts.devServer({
        // Customize host/port here if needed
        host: process.env.HOST,
        port: process.env.PORT
      })
    );
}


module.exports = validate(config);
