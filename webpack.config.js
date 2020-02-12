const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';
const mode = isProduction ? 'production' : 'development';
const devtool = isProduction ? 'source-map' : 'eval-source-map';

module.exports = {
  entry: { socket: './lib/index.ts' },
  target: 'web',
  mode,
  devtool,
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts'],
  },
  output: {
    filename: 'socket.js',
    path: path.resolve(__dirname, 'build'),
  },
};
