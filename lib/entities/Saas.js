// PROTOTYPE, WILL CHANGE
var util = require('util')
var Entity = require('../Entity')
var request = require('request')

// alternatively, construct errors on the fly:
// {name:'fileNotFound',msg:'whatever.exe not found'}

// sorry, @frill
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

// Main class that represents this module. Control inheritance below.
var Main = function(config) {
	if (!(this instanceof Main)) return new Main()
	Entity.call(this,config)

	// Reference object in method context
	var self = this

	console.assert(this.state.url,'Saas GW test: url must be set')

	this.interval = 15
	this.timeout  = this.interval/2 // TODO

	self.test = function() {
		request(self.state.url,function(err,res,body) {
			if (!err && res.statusCode == 200)
				self.state.pass()
			else if (err)
				self.state.fail(err)
			else
				self.state.fail(res.statusCode)
		})
	}
}

// Inheritance
util.inherits(Main, Entity)
// Exposure
module.exports = Main

//var foo = new Main({class:'wat',category:'ds',name:'sds',url:'http://darksky.io'})
