var tabs = {}
var instances = {}

// TODO: dummy instances to help alignment

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
socket.on('connect',function() { console.log('Connected to Algalon') })
socket.on('disconnect',function() { console.log('Lost connection to Algalon') })
socket.on('set',function(id,key,val){ instances[id].set(key,val) })
socket.on('append',function(id,key,val){ instances[id].append(key,val) })
socket.on('destroy',function(id){ instances[id].destroy(key,val) })
socket.on('create',function(id,entity){ createInstance(entity) })


var init = function(data) {
	// fade in, and extra delay per tab
	var fade = 300
	for (var i in data.categories) {
		var cat = data.categories[i]
		cat.fade = fade += 300
		tabs[cat.name] = new Tab(cat)
	}

	var fade = 300
	for (var i in data.instances) {
		var initial = data.instances[i]
		initial.fade = fade += 300
		createInstance(initial)
	}

	addDummies()
}

var createInstance = function(initial) {
	switch(initial.class) {
		case 'Httpservice':
			var instance = new Httpservice(initial)
		break;
		default:
			console.error('Unknown widget class:',initial.class)
	}
	instances[initial.id] = instance
}

// TODO treat categories as instances the same? or not?
var Tab = function(initial) {
	// TODO inheritance from generic Widget class

	var parentSelector = '#categories'

	var parent = $(parentSelector)
	var template = $( $('.tab.template')[0].outerHTML )
	parent.append(template)

	if (initial.fade)
		template.hide().stop(1).fadeIn(initial.fade)

	// stuff which does not need to change
	// and initial state
	$('i',template).addClass(initial.icon)
	$('.name',template).text(initial.name)
	$('.alerts',template).hide()
	template.removeClass('template')

	// better system later
	template.attr('title',initial.description)

	// stuff which does change
	this.set =  function(key,val) {
		switch(key) {
			case 'selected':
				if (val) {
					$(parentSelector+' .tab').removeClass('selected')
					template.addClass('selected')
				} else
					template.removeClass('selected')
			break;
			case 'alerts':
				if (!val)
					$('.alerts',template).hide().text(0)
				else
					$('.alerts',template).show().text(val)
			break;
			default:
				console.error('Unknown Tab widget key:',key)
		}
	}

	this.set('selected',initial.default)
}

// Httpservice widget controller/creator
var Httpservice = function(initial) {
	// TODO inheritance from generic Widget class

	var parentSelector = 'section'

	var parent = $(parentSelector)
	var template = $( $('.Httpservice.template')[0].outerHTML )
	parent.append(template)

	if (initial.fade)
		template.css('opacity',0).stop(1).animate({'opacity':1},initial.fade)

	// stuff which does not need to change
	// and initial state
	$('i',template).addClass(initial.icon || 'fa-cubes')
	$('.name',template).text(initial.name)
	$('.alerts',template).hide()
	template.removeClass('template')

	// better system later
	$('p',template).text(initial.description)

	if (typeof initial.healthy !== 'undefined')
		this.set('healthy',initial.healthy)

	// stuff which does change
	this.set =  function(key,val) {
		switch(key) {
			case 'healthy':
				if (!val) {
					//$('.status',template).text('OFFLINE')
					template.removeClass('pass').addClass('fail')
				} else {
					//$('.status',template).text('ONLINE')
					template.removeClass('fail').addClass('pass')
				}
			break;
			default:
				console.error('Unknown Httpservice widget key:',key)
		}
	}
}

// fake widgets to left-align
// TODO: do for each section
var addDummies = function() {
	var dummy = $($('section > *')[0].outerHTML)
	dummy.addClass('dummy').empty()

	for (var i=0;i<4;i++)
		$('section').append(dummy)
}
