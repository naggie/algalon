// PROTOTYPE, WILL CHANGE
var util = require('util')
var Tester = require('../Tester')
var request = require('request')


// nicely, native-dns emulates the standard node API
var dns = require('native-dns')


// Main class that represents this module. Control inheritance below.
var Main = function(config) {
	if (!(this instanceof Main)) return new Main()
	Tester.call(this,config)

	// Reference object in method context
	var self = this

	// css class/controller
	this.state.class = 'Saas'
	this.state.icon  = 'fa-globe'

	console.assert(this.state.ip,'DNS test: ip must be set')

	// DON'T FORGET TIMEOUT!
	this.interval = 10
	dns.platform.timeout = 5000
	dns.platform.attempts = 1
	dns.platform.servers = { address: this.state.ip, port: 53 }

	this.test = function() {
		dns.lookup('google.com',function(err,ip,family) {
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
util.inherits(Main, Tester)
// Exposure
module.exports = Main

