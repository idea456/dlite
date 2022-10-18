const path = require("path");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = {
  mode: "production",
  // target: ["web", "es6"],
  entry: "./src/index.js",
  output: {
    publicPath: "/",
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  stats: {
    optimizationBailout: true,
  },
  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.js$|.jsx$/,
        // use: {
        //     loader: "babel-loader",
        //     options: {
        //         presets: ["es2015", { modules: false }],
        //     },
        // },
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-react", "@babel/preset-env"],
          plugins: [
            ["@babel/plugin-transform-runtime"],
            [
              "@babel/plugin-transform-react-jsx",
              {
                pragma: "h",
                pragmaFrag: "Fragment",
              },
            ],
          ],
        },
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new BundleAnalyzerPlugin({
      generateStatsFile: true,
    }),
    new HtmlWebpackPlugin({
      inject: "head",
      template: "./index.html",
    }),
    new CompressionPlugin(),
    new MiniCssExtractPlugin(),
  ],
  optimization: {
    minimizer: [new CssMinimizerPlugin()],
    minimize: true,
  },
  resolve: {
    alias: {
      react: "preact-compat",
      "react-dom": "preact-compat",
    },
  },
};
