const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BundleAnalyzerPlugin =
    require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const CompressionPlugin = require("compression-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const port = process.env.PORT || 3000;

module.exports = {
    mode: "development",
    entry: "./src/index.js",
    output: {
        filename: "[name].[hash].js",
    },
    devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "babel-loader",
                    },
                ],
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            importLoaders: 1,
                            sourceMap: true,
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "public/index.html",
        }),
        new CompressionPlugin(),
        new MiniCssExtractPlugin(),
        new BundleAnalyzerPlugin(),
    ],
    devServer: {
        host: "localhost",
        port: port,
        historyApiFallback: true,
        open: true,
    },
    resolve: {
        alias: {
            react: "preact/compat",
            "react-dom": "preact/compat",
        },
    },
    optimization: {
        minimizer: ["...", new CssMinimizerPlugin()],
        splitChunks: {
            chunks: "all",
            minSize: 0, // overrides webpack's minimum 30kb file size during splitting
            maxInitialRequests: Infinity,
            cacheGroups: {
                // defines where we group chunks to output files
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name(module) {
                        const packageName = module.context.match(
                            /[\\/]node_modules[\\/](.*?)([\\/]|$)/,
                        )[1];
                        return `npm.${packageName.replace("@", "")}`;
                    },
                },
            },
        },
    },
};
