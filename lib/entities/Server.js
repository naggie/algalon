// PROTOTYPE, WILL CHANGE
var util = require('util')
var Entity = require('../Entity')
var request = require('request')

// TODO fail on bad stats

// Main class that represents this module. Control inheritance below.
var Main = function(config) {
	if (!(this instanceof Main)) return new Main()
	Entity.call(this,config)

	// Reference object in method context
	var self = this

	console.assert(this.state.hostname,'Server test: hostname must be set')

	// DON'T FORGET TIMEOUT!
	this.interval = 5

	this.test = function() {
		request({
			url:'http://'+self.state.hostname+':2010',
			timeout:1000*self.interval/2,
		},function(err,res,body) {
			if (!err && res.statusCode == 200) {
				var data = JSON.parse(body)
				if (!res.error)
					if(!data.error)
						self.update(data)
					else
						self.state.fail(res.error)
				else
					self.state.pass()
			} else if (err)
				self.state.fail(err)
			else
				self.state.fail('HTTP Error '+res.statusCode)
		})
	}

	this.update = function(data) {
		for (var i in data)
			self.state.set(i,data[i])
	}
}

// Inheritance
util.inherits(Main, Entity)
// Exposure
module.exports = Main

//var foo = new Main({class:'wat',category:'ds',name:'sds',url:'http://darksky.io'})
