var tabs = {}
var instances = {}

// TODO: dummy instances to help alignment

$(function() {
	$.ajax({
		url      : 'data',
		success  : init,
	})

})

var init = function(data) {
	for (var i in data.categories)
		tabs[data.categories[i].name] = new Tab(data.categories[i])

	for (var i in data.instances) {
		switch(data.instances[i].class) {
			case 'Httpservice':
				var instance = new Httpservice(data.instances[i])
			break;
			default:
				console.error('Unknown widget class:',data.instances[i].class)
		}
		instances[data.instances[i].id] = instance
	}

	addDummies()
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

	this.set('selected',initial.default)
}

// Httpservice widget controller/creator
var Httpservice = function(initial) {
	// TODO inheritance from generic Widget class

	var parentSelector = 'section'

	var parent = $(parentSelector)
	var template = $( $('.Httpservice.template')[0].outerHTML )
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
					$('.status',template).text('OFFLINE')
					template.addClass('offline')
				} else {
					$('.status',template).text('Online')
					template.removeClass('offline')
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
