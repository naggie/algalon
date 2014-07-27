#!/usr/bin/env node
/*
   Copyright 2014 Callan Bryant <callan.bryant@gmail.com>

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

var manifest = yaml.safeLoad( fs.readFileSync(__dirname+'/darksky.algalon.yaml', 'utf8') )

var rclient   = redis.createClient()
var restify   = require('restify')
var fs        = require('fs')

var server = restify.createServer({
	name: config.hostname,
	//certificate:'string',
	//key:'string',
	//version: '0.0.1'
})
server.use(restify.acceptParser(server.acceptable))
server.use(restify.queryParser())
server.use(restify.bodyParser({
	// req.body is then JSON content
	mapParams : false,
	uploadDir : config.tmp_dir,
}))
server.use(restify.jsonp())


server.get('/data',function(req,res,next) {
	res.header('Cache-Control','no-cache')
	database.serverstats(function(err,stats) {
		if (err) return res.send(500,err)
		res.send(200,stats)
	})
})


// web dashboard
server.get(/.+/,restify.serveStatic({
	directory:__dirname+'/web/',
	default:'index.html',
	//maxAge:3600,
//	maxAge:0, // disable cache
}))


server.listen(config.port,config.listen, function () {
	console.log('alagalon: %s listening at %s', server.name, server.url)
})

