'use strict'
process.env.NODE_ENV = 'development'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')

baseWebpackConfig.entry = utils.entries()
const devWebpackConfig = merge(baseWebpackConfig, {
	mode: 'development',
	module: {
		rules: utils.styleLoaders({
			sourceMap: config.dev.cssSourceMap,
			usePostCSS: true
		})
	},
	// cheap-module-eval-source-map is faster for development
	devtool: config.dev.devtool,
	plugins: [
		new webpack.DefinePlugin({
			'process.env': require('../config/dev.env'),
			PageInfo: 'window.PageInfo',
			Constants: JSON.stringify(utils.translate())
		}),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
		new webpack.NoEmitOnErrorsPlugin()
	].concat(utils.htmlPlugin())
})
module.exports = devWebpackConfig
