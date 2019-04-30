'use strict'
const path = require('path')
const utils = require('./utils')
const config = require('../config')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

function resolve (dir) {
	return path.join(__dirname, '..', dir)
}

module.exports = {
	context: path.resolve(__dirname, '../'),
	output: {
		path: config.build.assetsRoot,
		filename: '[name].js',
		publicPath:
			process.env.NODE_ENV === 'production'
				? config.build.assetsPublicPath
				: config.dev.assetsPublicPath
	},
	resolve: {
		extensions: ['.js', '.vue', '.json'],
		alias: {
			vue$: 'vue/dist/vue.esm.js'
		}
	},
	module: {
		rules: [
			{
				test: /\.vue$/,
				loader: 'vue-loader',
				exclude: /node_modules/,
				options: {
					transformAssetUrls: {
						video: ['src', 'poster'],
						source: 'src',
						img: 'src',
						image: 'xlink:href'
					}
				}
			},
			{
				test: /\.js$/,
				loader: 'babel-loader',
				include: [
					resolve('src'),
					resolve('test'),
					resolve('node_modules/webpack-dev-server/client')
				]
			},
			{
				test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
				loader: 'url-loader',
				options: {
					limit: 10000,
					name: utils.assetsPath('images/js_src_vue/[name].[ext]')
				}
			},
			{
				test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
				loader: 'url-loader',
				options: {
					limit: 10000,
					name: utils.assetsPath('images/js_src_vue/[name].[ext]')
				}
			},
			{
				test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
				loader: 'url-loader',
				options: {
					limit: 10000,
					name: utils.assetsPath('font/js_src_vue/[name].[ext]')
				}
			}
		]
	},
	plugins: [new VueLoaderPlugin()],
	node: {
		setImmediate: false,
		dgram: 'empty',
		fs: 'empty',
		net: 'empty',
		tls: 'empty',
		child_process: 'empty'
	}
}
