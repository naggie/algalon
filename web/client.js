var tabs = {}
var instances = {}
var sections = {}
var entityWidgets = {}

// TODO: dummy instances to help alignment
// // TODO assertions for parent selector

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
socket.on('disconnect',function() {
	console.log('Connection interrupted')
	$('.splash').show().text('Connection interrupted')
})
socket.on('reconnect',function() {
	console.log('Reconnected')
	$('.splash').show().text('Reloading...')
	setTimeout(function(){location.reload()},800)
})

var init = function(data) {
	var cats = $('#tabs')
	var article = $('article')

	// META
	// About tab which is mandatory (may change so it's instantiated like
	// other testers)
	data.categories.push({
		name:'About',
		//description:data.slogan,
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
		var section = new Section(article)
		if (cat.default) section.select()
		tab.on('click',section.select)
		tab.on('click',tab.select)
		tab.set('alerts',data.alerts[cat.name])
		tabs[cat.name] = tab
		sections[cat.name] = section
		$('<p />').text(cat.description).addClass('desc').appendTo(section.jqo)
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

var createInstance = function(state) {
	if(!tabs[state.category])
		return console.error('undefined category:',state.category)

	var parent = sections[state.category].jqo

	if(!entityWidgets[state.class])
		return console.error('Unknown Widget class:',state.class,state)

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
				$('.value',template).show().text(val+'%')
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
	var self = this
	// TODO inheritance from generic Widget class
	var template = $( $('.Saas.template')[0].outerHTML )
	parent.append(template)

	// stuff which does not need to change
	// and initial state
	$('i.logo',template).addClass(state.icon || 'fa-cubes')
	$('.name',template).text(state.name)
	template.removeClass('template')

	// better system later
	$('p',template).text(state.description)

	if (state.url) {
		$('.link',template).show()
		$('.link a',template)
			.text(state.url)
// TODO			.attr('href',state.url)

		template.on('click',function() {
			window.open(state.url)
		})
	}


	this.blinken = function() {
		$('.blinkenlight',template).addClass('on')
		setTimeout(function() {
			$('.blinkenlight',template).removeClass('on')
		},100)
	}

	// stuff which does change
	this.set =  function(key,val) {
		self.blinken()
		switch(key) {
			case 'healthy':
				if (!val)
					template.removeClass('pass').addClass('fail')
				else
					template.removeClass('fail').addClass('pass')
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
// each category *probably* has coherent widgets
var addDummies = function() {
	$('section').each(function(){
		var dummy = $($('*',this)[1].outerHTML)
		dummy.addClass('dummy').empty()

		for (var i=0;i<4;i++)
			$(this).append(dummy)
	})

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

var Section = function(parent) {
	var template = $('<section />')
	parent.append(template)
	template.hide()
	this.jqo = template

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

	// stuff which does change
	this.set =  function(key,val) {
		switch(key) {
			case 'healthy':
				if (!val)
					template.removeClass('pass').addClass('fail')
				else
					template.removeClass('fail').addClass('pass')
			break;
			default:
				console.error('Unknown Hacker widget key:',key)
		}
	}

	if (typeof state.healthy !== 'undefined')
		this.set('healthy',state.healthy)
}

// Saas widget controller/creator
// static stuff directly, dynamic stuff with .set()
entityWidgets['Server'] = function(parent,state) {
	var self = this
	// TODO inheritance from generic Widget class
	var template = $( $('.Server.template')[0].outerHTML )
	parent.append(template)

	// static stuff
	$('.name',template).text(state.name)
	template.removeClass('template')
console.log(state)
	// HACK TODO CHANGEME fit in Frill's ridiculously long server names
	if (state.name.length > 10)
		$('.name',template).css('font-size','0.85em')


	this.blinken = function() {
		$('.blinkenlight',template).addClass('on')
		setTimeout(function() {
			$('.blinkenlight',template).removeClass('on')
		},100)
	}

	// stuff which does change
	this.set =  function(key,val) {
		self.blinken()
		switch(key) {
			case 'disk_total':
				state['disk_total'] = val
				val = humanize.filesize(val,1024,0)
				$('.storage .max.limit',template).text(val)
			break
			case 'mem_total':
				state['mem_total'] = val
				val = humanize.filesize(val,1024,0)
				$('.memory .max.limit',template).text(val)
			break
			case 'uptime_secs':
				$('.uptime .value',template).text((val/86400).toFixed(0)+' days')
			break
			case 'load_percent':
				$('.load .value',template).text(val+'%').css('color',val>100?'red':'white')
				$('.load .bar',template).magicBar({gradient:'neutral',value:val})
			break;
			case 'mem_used':
				var bar = {gradient:'negative',value:val,max:state['mem_total']}
				console.log(bar)
				$('.memory .bar',template).magicBar(bar)
				val = humanize.filesize(val,1024,0)
				$('.memory .value',template).text(val).css('color',$.relateColour(bar) )
			break;
			case 'disk_used':
				var bar = {gradient:'negative',value:val,max:state['disk_total']}
				$('.storage .bar',template).magicBar(bar)
				val = humanize.filesize(val,1024,0)
				$('.storage .value',template).text(val).css('color',$.relateColour(bar) )
			break;
			case 'temperature_c':
				var bar = {gradient:'negative',value:val,max:80}
				$('.temperature',template).show()
				$('.temperature .value',template).html(val+'&deg;C').css('color',$.relateColour(bar) )
				$('.temperature .bar',template).magicBar(bar)
			break;
			case 'battery_percent':
				var bar = {gradient:'positive',value:val}
				$('.battery',template).show()
				$('.battery .value',template).css('color',$.relateColour(bar) )
				$('.battery .bar',template).magicBar(bar)
			break;
			case 'battery_minutes':
				$('.battery .value',template).text(val+' minutes')
			break;
			case 'line_voltage':
				var bar = {gradient:'bipolar',value:val,min:216,max:253}
				$('.voltage',template).show()
				$('.voltage .value',template).text(val+'V').css('color',$.relateColour(bar) )
				$('.voltage .bar',template).magicBar(bar)
			break;
			case 'healthy':
				if (!val)
					template.removeClass('pass').addClass('fail')
				else
					template.removeClass('fail').addClass('pass')
			break;
			case 'error':
				$('.error',template).text(val)
			break;
		}
	}

	if (typeof state.healthy !== 'undefined')
		this.set('healthy',state.healthy)

	this.set('error',state.error)

	// lazy!
	for (var i in state)
		this.set(i,state[i])
}

// probably should be a method of a widget parent class
// TODO request fullscreen just for this element?
// TODO center element (free above)
var JUMBOTRON = function(selector) {
	var jqo = $(selector)
	// destroy all other instances
	// hide everything else
	// calculate zoom level
	var height_ratio = $(window).height()/jqo.height()
	var width_ratio  = $(window).width()/jqo.width()

	// select smallest, this becomes the zoom level
	var ratio = Math.min(width_ratio,height_ratio)

	jqo.css({
		'zoom':ratio,
		'position':'fixed',
		'z-index':999999,
	})

	jqo.detach()
	$('body').empty().append(jqo).css('border','none')
	jqo.css('margin',0)

	// unsubscribe from averything else
	// zoom!
}
