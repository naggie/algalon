#!/usr/bin/env node
var yaml     = require('js-yaml')
var fs       = require('fs')
var async    = require('async')
var webshot  = require('webshot')

var manifest = yaml.safeLoad( fs.readFileSync(__dirname+'/../darksky.algalon.yaml', 'utf8') )


//var options = {
//	screenSize: { width: 330 , height: 768*330/1366 },
//	shotSize: { width: 330 , height: 768*330/1366 },
//	zoomFactor:330/1366,
//}


var dir = __dirname+'/../exports'

var options = {
	screenSize: { width: 330 , height: 768*330/1366 },
	shotSize: { width: 330 , height: 768*330/1366 },
	zoomFactor: 330/1366,
	phantomConfig: {'ignore-ssl-errors': 'true'},
	renderDelay:5000,
}

// wrapper for Sass initial object
var shot = function(tester,done) {
	if (tester.entity != 'HttpSaas') return  done()
	webshot(tester.url,dir+'/'+tester.name+'.png',options,done)
}

async.each(manifest.testers,shot,function(err) {
	if (err) console.log(err)
	process.exit(err?1:0)
})


//shot(manifest.testers[0],function(){})
