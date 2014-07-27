var tabs = {}

$(function() {
	$.ajax({
		url      : 'data',
		success  : init,
	})

})

var init = function(data) {
	for (var i in data.categories)
		tabs[data.categories[i].name] = new Tab(data.categories[i])
}

var Tab = function(initial) {
	// TODO inheritance from generic Widget class
	// TODO auto-hide alert numbers

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
			console.error('Unknown widget key:',key)
		}
	}

	this.set('selected',initial.default)
}
