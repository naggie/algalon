
var util = require('util')
var EventEmitter = require('events').EventEmitter
var Entity = require('./Entity')
var Saas = require('./entities/Saas')

// collects entities in .state attribute object suitable to serialise and feed to clients.
// listen to set and append events (id,key,val) to patch clients.
var Main = function() {
	if (!(this instanceof Main)) return new Main()
	EventEmitter.call(this)

	var self = this

	// object mapping ID to Entity objects.
	this.instances = {}

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
		self.addEntityInstance( new Saas(initial) )
	}

	this.addEntityInstance = function(entity) {
		console.assert(entity instanceof Entity,'Aggregator: only Entity instances can be used')

		if (! self.instances[entity.id]) {
			self.instances[entity.id] = entity
			entity.on('set',function(id,key,val) {
				self.emit('set',id,key,val)
				if (key == 'healthy')
					this.calculateHealth()
			})
			entity.on('append',function(id,key,val) { self.emit('append',id,key,val) })
			self.emit('create',entity.id,entity)
		}
	}

	this.calculateHealth = function() {
		var healths = []

		for (var i in self.instances) {
			if (typeof self.instances[i].healthy == 'undefined') return
			healths.push(self.instances[i].healthy)
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
