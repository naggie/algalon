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

if (process.env.CODEIN) require('node-codein')

var yaml     = require('js-yaml')
var restify  = require('restify')
var socketio = require('socket.io')
var fs       = require('fs')
var Aggr     = require('./lib/Aggregator')
var aggr     = new Aggr()

var manifest = yaml.safeLoad( fs.readFileSync(__dirname+'/darksky.algalon.yaml', 'utf8') )

aggr.instantiateTesters(manifest.testers)

if (!process.env.NOHOOKS)
	aggr.instantiateHooks(manifest.hooks)

var server = restify.createServer({
	name: manifest.name,
	//certificate:'string',
	//key:'string',
	//version: '0.0.1'
})

io = socketio.listen(server)

server.use(restify.acceptParser(server.acceptable))
server.use(restify.queryParser())
server.use(restify.bodyParser({
	// req.body is then JSON content
	mapParams : false,
}))
server.use(restify.jsonp())


var eventLog = []

// SW API
aggr.on('set',function(id,key,val){ io.emit('set',id,key,val) })
aggr.on('append',function(id,key,val){ io.emit('append',id,key,val) })
aggr.on('add',function(id,entity){ io.emit('add',id,entity) })
aggr.on('destroy',function(id,entity){ io.emit('destroy',id) })
aggr.on('health',function(health,rel){ io.emit('health',health,rel) })
aggr.on('alerts',function(cat,count){ io.emit('alerts',cat,count) })

aggr.on('event',function(e){
	eventLog.push(e)
	io.emit('event',e)
	if (eventLog.length > 50)
		eventLog.splice(0,eventLog.length-50)

	console.log(
			// unicode circle, red/green ansi
			(e.class == 'fail')?'\033[31m\u25cf\033[0m':'\033[32m\u25cf\033[0m'
	,e.date+': '+e.name+': '+e.message)
})

// REST API
server.get('/data',function(req,res,next) {
	res.header('Cache-Control','no-cache')
	res.send(200,{
		categories  : manifest.categories,
		name        : manifest.name,
		logo        : manifest.logo, // TODO allow logos near manifest file (proxy)
		slogan      : manifest.slogan,
		description : manifest.description,
		states      : aggr.states,
		health      : aggr.health, // %, also listen for health event
		alerts      : aggr.alerts,
		log         : eventLog,
	})
})

server.get(/exports.*/,function(req,res,next) {
	// YAY HACKS!
	req.url = req.url.substr('/exports'.length)
	req.path = function(){return req.url}

	var serve = restify.serveStatic({
		directory:__dirname+'/exports/',
		default:'index.html',
		//maxAge:3600,
	})

	serve(req,res,next)
})

// web dashboard
server.get(/.+/,restify.serveStatic({
	directory:__dirname+'/web/',
	default:'index.html',
	//maxAge:3600,
//	maxAge:0, // disable cache
}))


server.listen(
		process.env.PORT || manifest.port || 80,
		process.env.IP || manifest.listen || '0.0.0.0',
		function () {
	console.log('alagalon: %s listening at %s', server.name, server.url)
})


// Un-crash!
process.on('uncaughtException', function(error) {
	console.log('Uncaught exception: ' + error.stack+"\n");
})
