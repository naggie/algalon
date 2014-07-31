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

	console.assert(this.url,'Saas test: url must be set')

	interval = 15
	//TODO timeout = interval/2

	test = function() {
		return console.log(self)
		request(self.url,function(err,res,body) {
			if (!err && res.statusCode == 200){
				self.pass()
			}
			else {
				self.fail()
				self.set('error',err.message)
			}
		})
	}
}

// Inheritance
util.inherits(Main, Entity)
// Exposure
module.exports = Main

// ...alternatively, if only one instance will be used ever
//module.exports = new Main()


//var foo = new Main({class:'wat',category:'ds',name:'sds',url:'http://darksky.io'})
