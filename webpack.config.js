const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

module.exports = function (env){

    const config = {
        entry: "./src/js/app.js",
        output: {
            filename: "bundle.min.js",
            path: path.resolve(__dirname, 'dist')
        },
        watch: !!env.watch,
        mode: env.mode,
        devtool: env.mode === 'development' ? "source-map" : false,
        plugins: [
            new MiniCssExtractPlugin({
                filename: "style.css"
            })
        ],
        module: {
            rules: [
                {
                    test: /\.m?js$/i,
                    exclude: /(node_modules|bower_components)/,
                    use: [
                        {
                            loader: "babel-loader",
                            options: {
                                presets: ["@babel/preset-env"],
                                comments: env.mode === 'development',
                                minified: env.mode !== 'development',
                                compact: env.mode !== 'development',
                                sourceMaps: env.mode === 'development',
                            }
                        },
                    ]
                },
                {
                    test: /\.css$/i,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader'
                    ]
                },
                {
                    test: /\.html$/,
                    use: [
                      {
                        loader: 'html-loader',
                      }
                    ]
                  }
            ]
        },
    }

    return config;
}