
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

	// object mapping ID to states
	this.states = {}

	// health percentage
	this.health = 0

	this.instantiateEntities = function(initials) {
		for (var i in initials)
			self.instantiateEntity(initials[i])
	}

	// find and instantiate the appropriate class
	this.instantiateEntity = function(initial) {
		// for now, use only Entity: Sass
		// based on initial.class
		console.assert(initial.class,'Entity State: class must be defined')
		console.assert(initial.class.match(/[A-Z][a-z]+/),'Entity State: class name invalid')

		// require will throw an error if this module does not exist. If
		// it also caches the modules, so it's not necessary to cache here
		var Class = require('./entities/'+initial.class)

		self.addEntityInstance( new Class(initial) )
	}

	this.addEntityInstance = function(entity) {
		console.assert(entity instanceof Entity,'Aggregator: only Entity instances can be used')

		if (! self.instances[entity.id]) {
			self.instances[entity.id] = entity
			self.states[entity.id] = entity.state
			entity.state.on('set',function(key,val) {
				self.emit('set',entity.id,key,val)
				if (key == 'healthy')
					self.calculateHealth()
			})
			entity.state.on('append',function(key,val) { self.emit('append',entity.id,key,val) })
			self.emit('create',entity.id,entity)
		}
	}

	this.calculateHealth = function() {
		var healths = []

		for (var i in self.states) {
			if (typeof self.states[i].healthy == 'undefined') continue
			healths.push(self.states[i].healthy)
		}

		var total = 0

		for (var i in healths)
			total += healths[i]

		var health = (100*total/healths.length).toFixed(0)

		if (health != self.health)
			self.emit('health',health)

		self.health = health
		return health
	}

	// May be subject to change without notice
	// probably causes an entity to fade out, reduce width to 0 and remove
	// from DOM
	this.destroyEntity = function(entity) {
		delete this.instances[entity.id]
		delete this.states[entity.id]
		self.emit('destroy',entity.id)
	}
}

util.inherits(Main, EventEmitter)
module.exports = Main

// test
//var aggregator = new Main()
//var testEntity = new struct.Entity({class:'bar',name:'john',category:'beans'})
//aggregator.addEntity(testEntity)
//console.log(aggregator)
