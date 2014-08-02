// PROTOTYPE, WILL CHANGE
var util = require('util')
var Entity = require('../Entity')
var request = require('request')

// sorry, @frill
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

// Main class that represents this module. Control inheritance below.
var Main = function(config) {
	if (!(this instanceof Main)) return new Main()
	Entity.call(this,config)

	// Reference object in method context
	var self = this

	console.assert(this.state.url,'Saas GW test: url must be set')

	// DON'T FORGET TIMEOUT!
	this.interval = 10

	self.test = function() {
		request({
			url:self.state.url,
			timeout:1000*self.interval/2,
		},function(err,res,body) {
			if (!err && res.statusCode == 200) {
				if (config.verification)
					if(body.match(config.verification))
						self.state.pass()
					else
						self.state.fail('Application mismatch')
				else
					self.state.pass()
			} else if (err)
				self.state.fail(err)
			else
				self.state.fail('HTTP Error '+res.statusCode)
		})
	}
}

// Inheritance
util.inherits(Main, Entity)
// Exposure
module.exports = Main

//var foo = new Main({class:'wat',category:'ds',name:'sds',url:'http://darksky.io'})
