global.ENV = process.env.NODE_ENV || 'development'
var express = require('express')
var path = require('path')
var url = require('url')
var webpack = require('webpack')
var devConfig = require('./webpack.dev.conf')
var accountInfo = require('../../accountInfo')
var proxy = require('http-proxy-middleware')
var utils = require('./utils.js')
// 转发api

const config = {
	port: 7081
}

var app = express()

const devServerProxy = () => {
	const target = accountInfo.url || 'https://www.jianguoyun.com/'
	return {
		target,
		disableHostCheck: true,
		changeOrigin: true,
		secure: false,
		onProxyReq: onProxyReq(target)
	}
}

const onProxyReq = target => (proxyReq, req) => {
	const parsedUrl = url.parse(target) // eslint-disable-line node/no-deprecated-api
	const cookie = accountInfo.cookie
	if (cookie) {
		proxyReq.setHeader('Cookie', cookie)
	}
	proxyReq.setHeader('Origin', parsedUrl.host)

	proxyReq.setHeader('Host', parsedUrl.host)
	const referer = req.headers.referer

	proxyReq.setHeader(
		'Referer',
		referer
			? referer.replace(/https?:\/\/([^:]*):\d+\//, target.replace(/\/?$/, '/'))
			: target
	)
}

// 创建项目实例
const pages = utils.pages
const compiler = webpack(devConfig)
const devMiddleware = require('webpack-dev-middleware')(compiler, {
	publicPath: devConfig.output.publicPath,
	stats: {
		colors: true
	}
})

const hotMiddleware = require('webpack-hot-middleware')(compiler)

// 静态资源加载允许跨域
app.all('*', (req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*')
	next()
})

// 静态资源目录
app.use('/static', (req, res) => {
	let relpath = req.originalUrl.replace(/-(.){22}\./, '.')

	res.sendFile(relpath, { root: path.resolve(__dirname, '../../') })
})

app.use(devMiddleware)
app.use(hotMiddleware)

const pageHandler = function (req, res, next, pre) {
	if (
		req.params &&
		req.params.pagename &&
		req.params.pagename !== 'favicon.ico'
	) {
		let pagename
		for (let k in pages) {
			if (pages[k].path === pre + req.params.pagename) {
				pagename = pages[k].entry + '.html'
			}
		}
		if (!compiler.outputPath || !pagename) {
			next('路径无效')
			return
		}
		var filepath = path.join(compiler.outputPath, pagename)
		// 使用webpack提供的outputFileSystem读取内存中的html
		compiler.outputFileSystem.readFile(filepath, function (err, result) {
			if (err) {
				return next('输入路径无效，请输入目录名作为路径，有效路径有-：\n/')
			}
			// 发送获取到的页面
			res.set('content-type', 'text/html')
			res.send(result)
			res.end()
		})
	} else {
		res.end()
	}
}

// 其他页面
app.get('/:pagename?', (req, res, next) => pageHandler(req, res, next, '/'))
app.get('/s/:pagename?', (req, res, next) => pageHandler(req, res, next, '/s/'))



// 启动app的http服务并监听端口
app.listen(config.port, function (req, res) {
	console.log(
		'http服务监听启动 ,' +
		'  当前环境:' +
		process.env.NODE_ENV +
		' ,' +
		// ' 监听host:' + config.host + ' ,' +
		'  监听端口:' +
		config.port
	)
})
