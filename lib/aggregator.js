
var util = require('util')
var EventEmitter = require('events').EventEmitter
var struct = require('./struct')

// collects entities in .state attribute object suitable to serialise and feed to clients.
// listen to set and append events (id,key,val) to patch clients.
var Main = function() {
	if (!(this instanceof Main)) return new Main()
	EventEmitter.call(this)

	var self = this

	// object mapping ID to state objects.
	this.states = {}

	this.addEntity = function(entity) {
		if (!(entity instanceof struct.Entity))
			self.emit('error','Aggregator: only Entity instances can be used')

		if (! self.states[entity.state.id]) {
			self.states[entity.state.id] = entity.state
			entity.on('set',function(id,key,val) { self.emit('set',id,key,val) })
			entity.on('append',function(id,key,val) { self.emit('append',id,key,val) })
		}
	}

	// May be subject to change without notice
	this.removeEntity = function(entity) {
		delete this.states[entity.state.id]
	}
}

util.inherits(Main, EventEmitter)
module.exports = Main

// test
var aggregator = new Main()
var testEntity = new struct.Entity({class:'bar',name:'john',category:'beans'})
aggregator.addEntity(testEntity)
console.log(aggregator)
