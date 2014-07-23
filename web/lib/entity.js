var util = require('util')
var crypto = require('crypto')
var EventEmitter = require('events').EventEmitter

// Represents the state of an entity. Can be serialised, so that client can
// render and reference by a UID. Patches can be emitted to keep server/client
// states/views in sync.
var State = function(initial) {
	if (!(this instanceof State)) return new State()
	EventEmitter.call(this)

	if (!arguments[0])
		initial = {}

	// Reference object in method context
	var self = this

	// static stuff
	for (var i in initial) {
		self[i] = initial[i]
	}

	// DOM ID safe
	var generate_id = function() {
		var hash = crypto.createHash('sha1')
		var rand = Math.random().toString()
		hash.update(rand)
		return hash.digest('hex')
	}

	this.id = generate_id()

	// null/false/true, via test
	this.healthy = null

	// don't use this, access attributes directly
	//this.get = function(key) { }

	this.set = function(key,val) {
		self[key] = val
		self.emit('set',key,val)
	}

	this.append = function(key,val) {
		self[key].append(val)
		self.emit('append',key,val)
	}

	this.fail = function() {
		self.healthy = false
		self.emit('failed')
		self.emit('set',healthy,false)
	}

	this.pass = function() {
		self.healthy = false
		self.emit('passed')
		self.emit('set',healthy,true)
	}

	// I don't want these attributes (from eventemitter) when serialising.
	// I hope this won't break anything. It does not appear to.
	delete this._maxListeners
	delete this.domain
	//delete this._events (does not work)
}

// Inheritance
util.inherits(State, EventEmitter)


// Main class that represents this module. Control inheritance below.
var Main = function(config) {
	if (!(this instanceof Main)) return new Main()
	EventEmitter.call(this)

	// Reference object in method context
	var self = this

	// this is what the aggregator references in huge state array
	// a few standard attributes: name, description, url, category, icon
	this.state = new State(config)
	var state = this.state

	// what GUI widget to use, essentially
	this.class = config.class || 'NOT SET WTF'


}

// Inheritance
util.inherits(Main, EventEmitter)
// Exposure
module.exports = Main

var foo = new State({cheese:234})
	foo.on('set',function(a,b){console.log(a,b)})
	foo.set('foo','bar')
console.log(JSON.stringify(foo) )



