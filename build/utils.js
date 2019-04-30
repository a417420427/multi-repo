'use strict'
const path = require('path')
const config = require('../config')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const packageConfig = require('../package.json')
const glob = require('glob')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const PAGE_PATH = path.resolve(__dirname, '../src/pages')
const fs = require('fs')
const read = require('../../tool/properties-read.js')
const pagename = process.argv[2]
const hotMiddlewareScript = 'webpack-hot-middleware/client?reload=true'
const isDev = process.env.NODE_ENV === 'development'

// 所需入口文件及配置文件
let files = {
	PAGE_PATH: PAGE_PATH,
	// js入口
	entryFiles: glob.sync(PAGE_PATH + '/*/main.js'),
	// html入口
	entryHtml: glob.sync(PAGE_PATH + '/*/index.html'),
	// 相关配置
	entryConfig: glob.sync(PAGE_PATH + '/*/config.json')
}

let pages = {}

if (files.entryConfig.length > 0) {
	files.entryConfig.map(file => {
		let conf = fs.readFileSync(file, 'utf-8')
		conf = JSON.parse(conf)
		pages[conf.entry] = conf
	})
}

exports.pages = pages

// 入口有参数中有项目名 则只对单个项目进行操作
if (pagename) {
	pages = {
		[pagename]: pages[pagename]
	}
	files = {
		entryFiles: glob.sync(PAGE_PATH + '/' + pagename + '/main.js'),
		entryHtml: glob.sync(PAGE_PATH + '/' + pagename + '/index.html'),
		entryConfig: glob.sync(PAGE_PATH + '/' + pagename + '/config.json')
	}
}
exports.files = files

// 入口文件 - pages下的目录为文件名
exports.entries = function () {
	const maps
	for (let k in pages) {
		maps.push({
			entry: {
				vendor: pages[k].vendor,
				main: path.resolve(__dirname, '../src/pages/' + k + '/main.js')
			},
			path: k
		})
	}
	return maps
}

// 获取页面定义的翻译内容
exports.translate = function () {
	return read(
		path.resolve(__dirname, '../../properties/translation_zh_CN.properties')
	)
}

// htmlwebpackplugin
exports.htmlPlugin = function () {
	let entryHtml = files.entryHtml
	let arr = []
	entryHtml.forEach(filePath => {
		let reg = /.*\/js_src_vue\/src\/pages\/(.*)\/index\.html/
		let filename = filePath.replace(reg, '$1')
		let conf = {
			template: filePath,
			chunks: ['manifest', `vendor`, filename],
			filename: filename + '.html',
			inject: true
		}
		arr.push(new HtmlWebpackPlugin(conf))
	})
	return arr
}

exports.assetsPath = function (_path) {
	const assetsSubDirectory = !isDev
		? config.build.assetsSubDirectory
		: config.dev.assetsSubDirectory

	return path.posix.join(assetsSubDirectory, _path)
}

exports.cssLoaders = function (options) {
	options = options || {}

	const cssLoader = {
		loader: 'css-loader',
		options: {
			sourceMap: options.sourceMap
		}
	}

	const postcssLoader = {
		loader: 'postcss-loader',
		options: {
			sourceMap: options.sourceMap
		}
	}

	// 全局scss变量存放位置
	function resolveResouce (name) {
		return path.resolve(__dirname, '../src/styles/' + name)
	}

	// 添加scss全局变量
	function generateSassResourceLoader (publicPath) {
		var loaders = [
			cssLoader,
			// 'postcss-loader',
			'sass-loader',
			{
				loader: 'sass-resources-loader',
				options: {
					// it need a absolute path
					resources: [resolveResouce('common.scss')]
				}
			}
		]
		if (options.extract) {
			loaders.unshift({
				loader: MiniCssExtractPlugin.loader,
				options: {
					publicPath: publicPath || '/'
				}
			})
			return loaders
		} else {
			return ['vue-style-loader'].concat(loaders)
		}
	}

	// generate loader string to be used with extract text plugin
	function generateLoaders (loader, loaderOptions) {
		const loaders = options.usePostCSS
			? [cssLoader, postcssLoader]
			: [cssLoader]

		if (loader) {
			loaders.push({
				loader: loader + '-loader',
				options: Object.assign({}, loaderOptions, {
					sourceMap: options.sourceMap
				})
			})
		}

		// Extract CSS when that option is specified
		// (which is the case during production build)
		if (options.extract) {
			loaders.unshift(MiniCssExtractPlugin.loader)
			return loaders
		} else {
			return ['vue-style-loader'].concat(loaders)
		}
	}

	// https://vue-loader.vuejs.org/en/configurations/extract-css.html
	return {
		css: generateLoaders(),
		postcss: generateLoaders(),
		less: generateLoaders('less'),
		sass: generateSassResourceLoader(options.publicPath),
		scss: generateSassResourceLoader(options.publicPath),
		stylus: generateLoaders('stylus'),
		styl: generateLoaders('stylus')
	}
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
	const output = []
	const loaders = exports.cssLoaders(options)

	for (const extension in loaders) {
		const loader = loaders[extension]
		output.push({
			test: new RegExp('\\.' + extension + '$'),
			use: loader
		})
	}
	return output
}

exports.createNotifierCallback = () => {
	const notifier = require('node-notifier')

	return (severity, errors) => {
		if (severity !== 'error') return

		const error = errors[0]
		const filename = error.file && error.file.split('!').pop()

		notifier.notify({
			title: packageConfig.name,
			message: severity + ': ' + error.name,
			subtitle: filename || '',
			icon: path.join(__dirname, 'logo.png')
		})
	}
}
