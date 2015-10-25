var isDevServer = false;
process.argv.forEach(function(arg) { if(arg.indexOf("webpack-dev-server") > -1) isDevServer = true});

module.exports = {
    context: __dirname,
    entry: [
        isDevServer ? 'webpack/hot/dev-server' : null,
        isDevServer ? 'webpack-dev-server/client?http://localhost:8080' : null,
        "./src/boot.js",
    ].filter(Boolean),
    output: {
        path: __dirname + "/dist",
        filename: "umbra.js"
    },
    resolve: {
        extensions: ["", ".webpack.js", ".web.js", ".js", ".jsx"]
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel'
            },
            {
                test: /\.woff$/,
                loader: 'url?limit=100000'
            }
        ]
    }
};
