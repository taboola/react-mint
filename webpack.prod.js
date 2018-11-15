const path = require('path');
const MinifyPlugin = require("babel-minify-webpack-plugin");


module.exports = {
  mode: 'production',
  context: path.resolve(__dirname, 'src'),
  entry: './index.js',
  output: { 
    path: path.resolve(__dirname, 'dist'), 
    filename: 'index.js',
    library: 'index',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  resolve: {
    extensions: ['.js']
  },
  module: {
    rules: [
      {
        test: [/\.js$/],
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  plugins: [
    new MinifyPlugin()
  ]
}