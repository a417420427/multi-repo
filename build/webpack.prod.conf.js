'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const webpackMerge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const env = require('../config/prod.env')
const getWebpackConfig = ({ path: entryUrlPath, entry }) =>
	webpackMerge(baseWebpackConfig, {
		mode: 'production',
		module: {
			rules: utils.styleLoaders({
				sourceMap: config.build.productionSourceMap,
				extract: true,
				usePostCSS: true,
				publicPath: config.build.assetsPublicPath
			})
		},
		devtool: config.build.productionSourceMap ? config.build.devtool : false,
		entry,
		output: {
			path: config.build.assetsRoot,
			filename: `js/${entryUrlPath}/[name].vue.min.js`,
			chunkFilename: `js/${entryUrlPath}/[name].vue.min.js`,
			publicPath: config.build.assetsPublicPath
		},
		optimization: {
			runtimeChunk: {
				name: 'manifest'
			},
			splitChunks: {
				chunks: 'async',
				minSize: 30000,
				maxSize: 0,
				minChunks: 1,
				maxAsyncRequests: 5,
				maxInitialRequests: 3,
				automaticNameDelimiter: '~',
				name: true,
				cacheGroups: {
					vendors: {
						test: /[\\/]node_modules[\\/]/,
						priority: -10
					}
				}
			}
		},
		plugins: [
			// http://vuejs.github.io/vue-loader/en/workflow/production.html
			new webpack.DefinePlugin({
				'process.env': env,
				'process.env.NODE_ENV': env.NODE_ENV || 'production'
			}),

			// keep module.id stable when vendor modules does not change
			new webpack.HashedModuleIdsPlugin(),

			new MiniCssExtractPlugin({
				filename: utils.assetsPath(`css/${entryUrlPath}/[name].vue.min.css`),
				chunkFilename: utils.assetsPath(
					`css/${entryUrlPath}/[name].vue.min.css`
				),
				allChunks: true
			}),
			!config.build.productionGzip
				? null
				: new CompressionWebpackPlugin({
					asset: '[path].gz[query]',
					algorithm: 'gzip',
					test: new RegExp(
						'\\.(' + config.build.productionGzipExtensions.join('|') + ')$'
					),
					threshold: 10240,
					minRatio: 0.8
				})
		].filter(i => i)
	})

// if (config.build.bundleAnalyzerReport) {
//   const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
//   webpackConfig.plugins.push(new BundleAnalyzerPlugin())
// }

module.exports = utils.entries().map(v => getWebpackConfig(v))
