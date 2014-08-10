// PROTOTYPE, WILL CHANGE
var util = require('util')
var Entity = require('../Entity')
var request = require('request')

//var ntpClient = require('ntp-client')
// Wait for PR to get to NPM: https://github.com/moonpyk/node-ntp-client/pull/4
var ntpClient = require('../ntp-client')

// Main class that represents this module. Control inheritance below.
var Main = function(config) {
	if (!(this instanceof Main)) return new Main()
	Entity.call(this,config)

	// Reference object in method context
	var self = this

	// css class/controller
	this.state.class = 'Saas'
	this.state.icon = 'fa-history fa-flip-horizontal'

	console.assert(this.state.hostname,'NTP test: hostname must be set')

	// DON'T FORGET TIMEOUT!
	// ntp is actually quite slow. Don't reduce this.
	this.interval = 25
	ntpClient.ntpReplyTimeout = 1000*20

	this.test = function() {
		ntpClient.getNetworkTime(self.state.hostname,123,function(err,date) {
			if(err) {
				if (typeof err == 'string')
					return self.state.fail(err)
				else if (err.syscall = 'getaddrinfo')
					return self.state.fail('Could not resolve hostname')
				else
					self.state.fail(err)
				return
			}

			var remote = date.getTime()
			var local  = Date.now()

			// within 1000ms is a pass
			if (Math.abs(local-remote) < 1000)
				self.state.pass()
			else
				self.state.fail('Out of sync')
		})
	}
}

// Inheritance
util.inherits(Main, Entity)
// Exposure
module.exports = Main

