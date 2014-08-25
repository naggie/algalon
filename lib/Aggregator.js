
var util = require('util')
var EventEmitter = require('events').EventEmitter
var Tester = require('./Tester')

// collects testers in .state attribute object suitable to serialise and feed to clients.
// listen to set and append events (id,key,val) to patch clients.
var Main = function() {
	if (!(this instanceof Main)) return new Main()
	EventEmitter.call(this)

	var self = this

	// object mapping ID to Tester objects.
	this.instances = {}

	// object mapping ID to states
	this.states = {}

	// health percentage
	this.health = 0

	// failure count per category
	this.alerts = {}

	this.stagger = 0

	// hook instances
	this.hooks = []

	// array of cloned states each time something happened
	this.log = []

	this.instantiateTesters = function(initials) {
		for (var i in initials)
			self.instantiateTester(initials[i])
	}

	// find and instantiate the appropriate class
	this.instantiateTester = function(initial) {
		// for now, use only Tester: Sass
		// based on initial.class
		console.assert(initial.entity,'Tester State: entity must be defined')
		console.assert(initial.entity.match(/[A-Z][a-z]+/),'Tester State: class name invalid')

		// require will throw an error if this module does not exist. If
		// it also caches the modules, so it's not necessary to cache here
		var Class = require('./testers/'+initial.entity)

		self.addTesterInstance( new Class(initial) )
	}

	this.addTesterInstance = function(entity) {
		console.assert(entity instanceof Tester,'Aggregator: only Tester instances can be used')

		if (! self.instances[entity.id]) {
			self.instances[entity.id] = entity
			self.states[entity.id] = entity.state
			entity.state.on('set',function(key,val) {
				self.emit('set',entity.id,key,val)
				if (key == 'healthy') {
					self.calculateHealth()
					// this has changed for this category (except initial, but who cares?)
					var cat = entity.state.category
					self.emit('alerts',cat,self.alerts[cat])
				}
			})
			entity.state.on('append',function(key,val) { self.emit('append',entity.id,key,val) })
			entity.state.on('broken',self.broadcast)
			self.emit('create',entity.id,entity)
		}

		// different tick each
		setTimeout(function() {
			entity.test()
			entity.timer = setInterval(function() {
				entity.test()
			},entity.interval*1000)
		},2800+self.stagger++)
	}

	var last_total_passes = 0
	this.calculateHealth = function() {
		var healths = []
		self.alerts = {}

		for (var i in self.states) {
			var healthy = self.states[i].healthy
			var cat = self.states[i].category

			if (typeof healthy == 'undefined') continue

			healths.push(healthy)

			if (!healthy)
				// increment on undefined is OK
				self.alerts[cat] = self.alerts[cat]?self.alerts[cat]+1:1
		}

		var total = 0

		for (var i in healths)
			total += healths[i]

		var health = (100*total/healths.length).toFixed(0)

		//if (health != self.health)
		if (total != last_total_passes)
			self.emit('health',health,total-last_total_passes)

		self.health = health
		last_total_passes = total
		return health
	}

	// May be subject to change without notice
	// probably causes an entity to fade out, reduce width to 0 and remove
	// from DOM
	this.destroyTester = function(entity) {
		delete this.instances[entity.id]
		delete this.states[entity.id]
		self.emit('destroy',entity.id)
	}

	this.reportBroken = function(state) {
	}

	this.instantiateHooks = function(initials) {
		for (var i in initials) {
			var initial = initials[i]
			// require will throw an error if this module does not exist. If
			// it also caches the modules, so it's not necessary to cache here
			var Class = require('./hooks/'+initial.class)

			self.hooks.push( new Class(initial) )
		}
	}

	// all hooks
	this.broadcast = function(state) {
		for (var i in self.hooks)
			self.hooks[i].broadcast(state)

		console.log(state.date+': '+state.name+': '+state.error)
	}
}

util.inherits(Main, EventEmitter)
module.exports = Main

// test
//var aggregator = new Main()
//var testTester = new struct.Tester({class:'bar',name:'john',category:'beans'})
//aggregator.addTester(testTester)
//console.log(aggregator)
