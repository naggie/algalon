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
	// TODO .call(this,initial) in subclasses to act as constructor
	// TODO inheritance from generic Widget class
	// TODO auto-hide alert numbers
	// TODO set method (used by constructor, also)

	var parent = $('#categories')
	var template = $( $('.tab.template')[0].outerHTML )
	parent.append(template)

	$('i',template).addClass(initial.icon)
	$('.name',template).text(initial.name)
	$('.alerts',template).hide()
	template.removeClass('template')

	if (initial.default)
		template.addClass('selected')

	// better system later
	template.attr('title',initial.description)
}
