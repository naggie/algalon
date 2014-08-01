// PROTOTYPE, WILL CHANGE
var util = require('util')
var Entity = require('../Entity')
var request = require('request')
var crypto = require('crypto')

// Main class that represents this module. Control inheritance below.
var Main = function(initial) {
	if (!(this instanceof Main)) return new Main()
	Entity.call(this,initial)

	// Reference object in method context
	var self = this

	console.assert(initial.email,'Hacker GW test: email must be set')
	initial.email = initial.email.toLowerCase().match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}/)[0]
	console.assert(initial.email,'Hacker GW test: invalid email')

        var hash = crypto.createHash('md5')
	hash.update(initial.email)
	var imgurl = 'https://www.gravatar.com/avatar/'+hash.digest('hex')+'?s=160'
	console.log(imgurl)
        this.state.set('imgurl',imgurl)
}

// Inheritance
util.inherits(Main, Entity)
// Exposure
module.exports = Main
