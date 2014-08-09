// PROTOTYPE, WILL CHANGE
var util = require('util')
var Entity = require('../Entity')
var request = require('request')
var crypto = require('crypto')

// Main class that represents this module. Control inheritance below.
var Main = function(initial) {
	if (!(this instanceof Main)) return new Main()

	// Reference object in method context
	var self = this

	console.assert(initial.email,'Hacker GW test: email must be set')
	var email = initial.email.toLowerCase().match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}/)[0]
	console.assert(initial.email,'Hacker GW test: invalid email')
	delete initial.email // provide some anonymity, ish. Hackers will crack anyway.
        var hash = crypto.createHash('md5')
	hash.update(email)
	var imgurl = 'https://www.gravatar.com/avatar/'+hash.digest('hex')+'?s=160'

	// Call constructor after, so email is not in state
	Entity.call(this,initial)
        this.state.imgurl = imgurl

	// css class/controller
	this.state.class = 'Hacker'

}

// Inheritance
util.inherits(Main, Entity)
// Exposure
module.exports = Main
