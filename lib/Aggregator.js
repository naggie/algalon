
var util = require('util')
var EventEmitter = require('events').EventEmitter
var Entity = require('./Entity')

// collects entities in .state attribute object suitable to serialise and feed to clients.
// listen to set and append events (id,key,val) to patch clients.
var Main = function() {
	if (!(this instanceof Main)) return new Main()
	EventEmitter.call(this)

	var self = this

	// object mapping ID to Entity objects.
	this.instances = {}

	// health percentage TODO
	this.health = 100

	this.instantiateEntities = function(initials) {
		for (var i in initials)
			self.instantiateEntity(initials[i])
	}

	// find and instantiate the appropriate class
	this.instantiateEntity = function(initial) {
		// for now, use generic template
		// based on initial.class
		self.addEntityInstance( new Entity(initial) )
	}

	this.addEntityInstance = function(entity) {
		console.assert(entity instanceof Entity,'Aggregator: only Entity instances can be used')

		if (! self.instances[entity.id]) {
			self.instances[entity.id] = entity
			entity.on('set',function(id,key,val) { self.emit('set',id,key,val) })
			entity.on('append',function(id,key,val) { self.emit('append',id,key,val) })
			self.emit('add',entity)
		}
	}

	// May be subject to change without notice
	this.removeEntity = function(entity) {
		delete this.instances[entity.id]
		self.emit('delete',entity.id)
	}
}

util.inherits(Main, EventEmitter)
module.exports = Main

// test
//var aggregator = new Main()
//var testEntity = new struct.Entity({class:'bar',name:'john',category:'beans'})
//aggregator.addEntity(testEntity)
//console.log(aggregator)
