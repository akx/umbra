module.exports = {
	context: __dirname,
	entry: "./src/boot.js",
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
			}
		]
	}
};