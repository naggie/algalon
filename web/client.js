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
socket.on('disconnect',function() { console.log('Lost connection to Algalon! TODO: resync') })

var init = function(data) {
	console.log(data)
	for (var i in data.categories)
		tabs[data.categories[i].name] = new Tab(data.categories[i])

	for (var i in data.states)
		instances[data.states[i].id] = createInstance(data.states[i])

	addDummies()

	socket.on('set',function(id,key,val){ instances[id] && instances[id].set(key,val) })
	socket.on('append',function(id,key,val){ instances[id] && instances[id].append(key,val) })
	socket.on('destroy',function(id){ instances[id] && instances[id].destroy(key,val) })
	socket.on('create',function(id,state){ instances[id] && createInstance(state) })

}

var createInstance = function(initial) {
	switch(initial.class) {
		case 'Saas':
			var instance = new Saas(initial)
		break;
		default:
			console.error('Unknown widget class:',initial.class)
	}
	return instance
}

// TODO treat categories as instances the same? or not?
var Tab = function(initial) {
	// TODO inheritance from generic Widget class

	var parentSelector = '#categories'

	var parent = $(parentSelector)
	var template = $( $('.tab.template')[0].outerHTML )
	parent.append(template)

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

	this.set('selected',!!initial.default)
}

// Saas widget controller/creator
// static stuff directly, dynamic stuff with .set()
var Saas = function(initial) {
	// TODO inheritance from generic Widget class

	var parentSelector = 'section'

	var parent = $(parentSelector)
	var template = $( $('.Saas.template')[0].outerHTML )
	parent.append(template)

	// stuff which does not need to change
	// and initial state
	$('i',template).addClass(initial.icon || 'fa-cubes')
	$('.name',template).text(initial.name)
	$('.alerts',template).hide()
	template.removeClass('template')

	// better system later
	$('p',template).text(initial.description)

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

	if (typeof initial.healthy !== 'undefined')
		this.set('healthy',initial.healthy)

	this.set('error',initial.error)
}

// fake widgets to left-align
// TODO: do for each section
var addDummies = function() {
	var dummy = $($('section > *')[0].outerHTML)
	dummy.addClass('dummy').empty()

	for (var i=0;i<4;i++)
		$('section').append(dummy)
}
