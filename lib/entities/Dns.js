// PROTOTYPE, WILL CHANGE
var util = require('util')
var Entity = require('../Entity')
var request = require('request')
var dns = require('dns')


// Main class that represents this module. Control inheritance below.
var Main = function(config) {
	if (!(this instanceof Main)) return new Main()
	Entity.call(this,config)

	// Reference object in method context
	var self = this

	// css class/controller
	this.state.class = 'Saas'

	console.assert(this.state.hostname,'NTP test: hostname must be set')

	// DON'T FORGET TIMEOUT!
	this.interval = 10
	//this.timeout = this.interval/2
	// node DNS will have its own timeout

	this.test = function() {
		dns.lookup('google.coiim',function(err,ip,family) {
			if (err)
				self.state.fail(self.lookup(err.code))
			else
				self.state.pass()
		})
	}

	this.lookup = function(code) {
		switch(code) {
			case dns.NODATA      : return "DNS server returned answer with no data"
			case dns.FORMERR     : return "DNS server claims query was misformatted"
			case dns.SERVFAIL    : return "DNS server returned general failure"
			case dns.NOTFOUND    : return "Domain name not found"
			case dns.NOTIMP      : return "DNS server does not implement requested operation"
			case dns.REFUSED     : return "DNS server refused query"
			case dns.BADQUERY    : return "Misformatted DNS query"
			case dns.BADNAME     : return "Misformatted domain name"
			case dns.BADFAMILY   : return "Unsupported address family"
			case dns.BADRESP     : return "Misformatted DNS reply"
			case dns.CONNREFUSED : return "Could not contact DNS servers"
			case dns.TIMEOUT     : return "Timeout while contacting DNS servers"
			case dns.NOMEM       : return "Out of memory"
			case dns.DESTRUCTION : return "Channel is being destroyed"
			case dns.BADSTR      : return "Misformatted string"
			case dns.CANCELLED   : return "DNS query cancelled"
			default              : return "Unknown error"
		}
	}
}

// Inheritance
util.inherits(Main, Entity)
// Exposure
module.exports = Main

