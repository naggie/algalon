var request = require('request')

var util = require('util')
var EventEmitter = require('events').EventEmitter

var Main = function(initial) {
	if (!(this instanceof Main)) return new Main()

	// call parent constructor, with parameters also!
	EventEmitter.call(this)

	// Reference object in method context
	var self = this

	this.push = function(event) {
		if (event.class != 'broken') return
		request.post({
			url:initial.url,
			json:true,
		}, function(error, response, body) {
			if (error)
				return console.log('DSPA: API connection error',error)
			else if (response.statusCode != 200)
				return console.log('DSPA: API response error '+response.statusCode)
		}).form({
			key:initial.key,
			msg:'Warning: '+event.message+', '+event.name,
			chime:initial.chime,
			personality:true,
		})
	}

}

// Inheritance
util.inherits(Main, EventEmitter)
// Exposure
module.exports = Main

