const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BundleAnalyzerPlugin =
    require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const CompressionPlugin = require("compression-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { ESBuildMinifyPlugin } = require("esbuild-loader");
const PreloadWebpackPlugin = require("@vue/preload-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const port = process.env.PORT || 3000;

module.exports = {
    mode: "development",
    entry: "./src/index.js",
    output: {
        filename: "[name].[contenthash].js",
    },
    devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "esbuild-loader",
                        options: {
                            loader: "jsx", // Remove this if you're not using JSX
                            target: "es2015", // Syntax to compile to (see options below for possible values)
                        },
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
        new MiniCssExtractPlugin({
            filename: "[name].[contenthash].css", // contenthash for long-term caching
        }),
        new webpack.ProvidePlugin({
            React: "react",
        }),
        // new PreloadWebpackPlugin({
        //     rel: "preload",
        //     as(entry) {
        //         if (/\.css$/.test(entry)) return "style";
        //     },
        // }),
    ],
    devServer: {
        host: "localhost",
        port: port,
        historyApiFallback: true,
        open: true,
        hot: true,
        static: "./dist",
    },
    resolve: {
        alias: {
            react: "preact/compat",
            "react-dom": "preact/compat",
        },
    },
    optimization: {
        minimize: true,
        // https://github.com/privatenumber/minification-benchmarks
        minimizer: [new ESBuildMinifyPlugin({ css: true })],
        // minimizer: [
        //     new TerserPlugin({
        //         minify: TerserPlugin.swcMinify,
        //         terserOptions: {},
        //     }),
        // ],
        splitChunks: {
            chunks: "all",
            minSize: 0, // overrides webpack's minimum 30kb file size during splitting
            minChunks: 2,
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
