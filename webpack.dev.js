const path = require('path');

module.exports = {
  mode: 'development',
  context: path.resolve(__dirname, 'demo', 'src'),
  entry: './index.js',
  output: { 
    path: path.resolve(__dirname, 'demo', 'public'), 
    filename: 'index.js',
  },
  resolve: {
    extensions: ['.js']
  },
  module: {
    rules: [
      {
        test: [/\.js$/],
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
}