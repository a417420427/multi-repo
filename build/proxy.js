var express = require('express')
var accountInfo = require('../../accountInfo').demo8
var proxy = require('http-proxy-middleware')
var url = require('url')
var app = express()

const devServerProxy = () => {
	const target = accountInfo.url || 'https://demo.jianguoyun.com/'
	return {
		target,
		disableHostCheck: true,
		changeOrigin: true,
		secure: false,
		onProxyReq: onProxyReq(target)
	}
}

const onProxyReq = target => (proxyReq, req, res) => {
	const parsedUrl = url.parse(target) // eslint-disable-line node/no-deprecated-api
	const cookie = accountInfo.cookie
	proxyReq.setHeader('Origin', parsedUrl.host)
	proxyReq.setHeader('Cookie', cookie)
	proxyReq.setHeader('Host', parsedUrl.host)
	const referer = req.headers.referer

	proxyReq.setHeader(
		'Referer',
		referer
			? referer.replace(/https?:\/\/([^:]*):\d+\//, target.replace(/\/?$/, '/'))
			: target
	)
}

app.use('/d', proxy(devServerProxy()))
app.use('/c', proxy(devServerProxy()))
