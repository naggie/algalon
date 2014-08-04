var tabs = {}
var instances = {}
var sections = {}
var entityWidgets = {}

// autoupdate: client will check this on reconnect, if different reload page
var serial = 0


// TODO: dummy instances to help alignment
// // TODO assertions for parent selector
// TODO static Tab attr (health)

$(function() {
	$.ajax({
		url      : 'data',
		success  : init,
	})
})

var socket = io.connect(undefined,{
	//"auto connect":false,
	'reconnection limit': 20000, // try at least every 20 seconds
	'max reconnection attempts': Infinity
})

socket.on('connect',function() {
	console.log('Connected to Algalon')
	$.ajax({
		url      : 'serial',
		success  : function(newserial) { if (newserial != serial) update() },
	})
})
socket.on('disconnect',function() { console.log('Lost connection to Algalon! TODO: resync') })

var init = function(data) {
	var cats = $('#tabs')
	var article = $('article')

	serial = data.serial

	// META
	// About tab which is mandatory (may change so it's instantiated like
	// other entities)
	data.categories.push({
		name:'About',
		description:data.slogan,
		icon:'fa-info-circle',
	})
	data.states['about'] = {
		imgurl:data.logo,
		description:data.description,
		category:'About',
		class:'About',
	}

	for (var i in data.categories) {
		var cat = data.categories[i]
		var tab = new Tab(cats,cat)
		var section = new Section(article,cat.description)
		if (cat.default) section.select()
		tab.on('click',section.select)
		tab.on('click',tab.select)
		tab.set('alerts',data.alerts[cat.name])
		tabs[cat.name] = tab
		sections[cat.name] = section
	}

	for (var i in data.states)
		instances[data.states[i].id] = createInstance(data.states[i])

	addDummies()

	// health
	var healthTab = new Tab($('#info'),{
		icon:'fa-heart',
		name:'Health',
	    	health:data.health,
	})

	// WS API : TODO replace with single patch event
	socket.on('set',function(id,key,val){ instances[id] && instances[id].set(key,val) })
	socket.on('append',function(id,key,val){ instances[id] && instances[id].append(key,val) })
	socket.on('destroy',function(id){ instances[id] && instances[id].destroy(key,val) })
	socket.on('create',function(id,state){ instances[id] && createInstance(state) })
	socket.on('alerts',function(cat,count){ tabs[cat] && tabs[cat].set('alerts',count) })
	socket.on('health',function(percent){ healthTab.set('health',percent) })
}

var update = function() {
	$('.splash').show().text('DOWNLOADING UPDATE')
	setTimeout(function() {location.reload() },1000)
}

var createInstance = function(state) {
	if(!tabs[state.category])
		return console.error('undefined category:',state.category)

	var parent = sections[state.category].jqo

	if(!entityWidgets[state.class])
		return console.error('Unknown Widget class:',state.class)

	var Class = entityWidgets[state.class]
	var instance = new Class(parent,state)

	return instance
}

// TODO treat categories as instances the same? or not?
var Tab = function(parent,state) {
	// TODO inheritance from generic Widget class
	var template = $( $('.tab.template')[0].outerHTML )
	parent.append(template)

	// stuff which does not need to change
	// and initial state
	$('i',template).addClass(state.icon)
	$('.name',template).text(state.name)
	$('.alerts',template).hide()
	template.removeClass('template')

	// kind of like eventemitter!
	// direct mapping impossible
	this.on = function(event,fn) {
		if (event == 'click') template.addClass('button')
		template.on(event,fn)
	}

	// better system later
	template.attr('title',state.description)

	this.select = function() {
		$('.tab',parent).removeClass('selected')
		template.addClass('selected')
	}

	// stuff which does change (state control)
	this.set =  function(key,val) {
		switch(key) {
			case 'alerts':
				if (!val)
					$('.alerts',template).hide().text(0)
				else
					$('.alerts',template).show().text(val)
			break;
			case 'health':
				$('.health',template).show()
				$('.bar',template).stop(1).animate({'width':val+'%'})
			break;
			default:
				console.error('Unknown Tab widget key:',key)
		}
	}

	if (state.default)
		this.select()

	if (typeof state.health !== 'undefined')
		this.set('health',state.health)
}

// Saas widget controller/creator
// static stuff directly, dynamic stuff with .set()
entityWidgets['Saas'] = function(parent,state) {
	// TODO inheritance from generic Widget class
	var template = $( $('.Saas.template')[0].outerHTML )
	parent.append(template)

	// stuff which does not need to change
	// and initial state
	$('i',template).addClass(state.icon || 'fa-cubes')
	$('.name',template).text(state.name)
	$('.alerts',template).hide()
	template.removeClass('template')

	// better system later
	$('p',template).text(state.description)

	template.on('click',function() {
		window.open(state.url)
	})

	// stuff which does change
	this.set =  function(key,val) {
		switch(key) {
			case 'healthy':
				if (!val) {
					//$('.status',template).text('OFFLINE')
					template.removeClass('pass').addClass('fail')
					$('.error',template).show()
				} else {
					//$('.status',template).text('ONLINE')
					template.removeClass('fail').addClass('pass')
					$('.error',template).hide()
				}
			break;
			case 'error':
				$('.error',template).text(val)
			break;
			default:
				console.error('Unknown Saas widget key:',key)
		}
	}

	if (typeof state.healthy !== 'undefined')
		this.set('healthy',state.healthy)

	this.set('error',state.error)
}

// fake widgets to left-align
// TODO: do for each section
var addDummies = function() {
	return console.log('TODO: dummies')
	var dummy = $($('section > *')[0].outerHTML)
	dummy.addClass('dummy').empty()

	for (var i=0;i<4;i++)
		$('section').append(dummy)
}

// Saas widget controller/creator
// static stuff directly, dynamic stuff with .set()
entityWidgets['Hacker'] = function(parent,state) {
	// TODO inheritance from generic Widget class
	var template = $( $('.Hacker.template')[0].outerHTML )
	parent.append(template)
	template.removeClass('template')

	$('img',template).attr('src',state.imgurl)
	$('.username',template).text(state.username)
	$('.name',template).text(state.name)

	template.click(function() { window.open(state.profile) })
}

var Section = function(parent,description) {
	var template = $('<section />')
	parent.append(template)
	template.hide()
	this.jqo = template

	if (description)
		$('<p />').text(description).appendTo(template)

	this.select = function() {
		$('section',parent).hide()
		template.show()
	}
}

// Saas widget controller/creator
// static stuff directly, dynamic stuff with .set()
entityWidgets['About'] = function(parent,state) {
	// TODO inheritance from generic Widget class
	var template = $( $('.About.template')[0].outerHTML )
	parent.append(template)
	template.removeClass('template')

	$('img',template).attr('src',state.imgurl)
	$('.description',template).text(state.description)
}
