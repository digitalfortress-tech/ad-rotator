/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/ad-rotator.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'ad-rotator.js',
    library: 'rotator',
    libraryExport: 'rotator', // to export only the default fn
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  devtool: 'source-map',
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        enforce: 'pre',
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'eslint-loader',
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          // 'style-loader',
          'css-loader',
          'less-loader',
        ],
      },
    ],
  },
  optimization: {
    minimizer: [
      // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
      '...',
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      cacheGroups: {
        // extract entire css into a single file named "style.css"
        styles: {
          name: 'style',
          type: 'css/mini-extract',
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
};
