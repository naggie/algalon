// PROTOTYPE, WILL CHANGE
var util = require('util')
var Tester = require('../Tester')
var request = require('request')

// TODO fail on bad stats
//
// TODO: autodetect 110V/230V and tolerances

// Main class that represents this module. Control inheritance below.
var Main = function(config) {
	if (!(this instanceof Main)) return new Main()
	Tester.call(this,config)

	// Reference object in method context
	var self = this

	// css class/controller
	this.state.class = 'Server'

	this.assertions = 12

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
				if(!data.error) {
					self.update(data)
					if(data['temperature_c'] > 80)
						self.state.fail('Overheat alert')
					else if (data['disk_used']/data['disk_total'] > 0.9)
						self.state.fail('Disk space alert')
					else if (data['mem_used']/data['mem_total'] > 0.95)
						self.state.fail('Application memory usage alert')
					else if (data['battery_percent'] < 30)
						self.state.fail('Backup power low')
					else if (data['line_voltage'] < 10)
						self.state.fail('Grid power failure')
					else if (data['line_voltage'] > 253)
						self.state.fail('Mains over-voltage alert')
					else if (data['line_voltage'] < 216)
						self.state.fail('Mains under-voltage alert')
					else if (data.version != 4)
						self.state.fail('Gremlin update required')
					else
						self.state.pass()
				} else
					self.state.fail(data.error)
			} else if (err) {
				if (err.message == 'getaddrinfo ENOTFOUND')
					err.message = 'Missing DNS entry'
				else if (err.message == 'ETIMEDOUT')
					err.message = 'Server offline'
				else if (err.message == 'connect ECONNREFUSED')
					err.message = 'Gremlin status reporter not running'

				self.state.fail(err)
			} else
				self.state.fail('HTTP Error '+res.statusCode)
		})
	}

	this.update = function(data) {
		for (var i in data)
			self.state.set(i,data[i])
	}
}

// Inheritance
util.inherits(Main, Tester)
// Exposure
module.exports = Main

//var foo = new Main({class:'wat',category:'ds',name:'sds',url:'http://darksky.io'})
