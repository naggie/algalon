/*
magicBar jQuery plugin

Expressive, animated progress bars. Requires jquery UI core


// Copyright 2012-2014 Callan Bryant <callan.bryant@gmail.com>
// http://callanbryant.co.uk/
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

# Usage
Select a div, call magicBar with an object of options, eg:

	$('#progress').magicBar(
	{
		value: 13,
		min: 0,              // default is 0
		max: 122,            // default is 100
		gradient: "negative" // default is null
	});

# "gradient" options

	negative : More is bad	(green-red)
	positive : Less is bad  (red-green)
	bipolar  : Either side of half is bad (red-green-red)
	null     : Anything is neutral (blue)
*/

/*
The follwing wrapper is an anonymous function that accepts the
jQuery object as its parameter as $. It is then called with
jQuery as its parameter directly.

The net effect guarentees $ as jQuery in this scope.

	(function( $ ){ // plugin goes here })( jQuery );
*/
(function( $ ){

$.fn.magicBar = function(options){
	// defined defaults
	var settings = {
		value: 0,
		min: 0,
		max: 100,
		gradient: null
	}
	if (options)
		$.extend(settings,options);

	// percent value to set width of bar
	var percent = ((settings.value-settings.min)/(settings.max-settings.min))*100;

	if (settings.max == settings.min)
		percent = 0;

	// keep within range
	percent = Math.max(0,percent);
	percent = Math.min(100,percent);

	var colour = $.relateColour(settings);

	// ensure there the divs are set up right, individually
	this.css('background-color','black');
	this.each(function(){
		if (!$(this).children().hasClass('magicBar'))
			$('<div class="magicBar"></div>').appendTo(this)
				.css('height','100%')
				.css('width',percent+'%')
				.css('background-color',colour);
	});

	// animate to new colour and width
	//$('.magicBar',this).stop(true).animate({
	// no animation
	$('.magicBar',this).css({
		'background-color' : colour,
		'width' : percent+'%'
	});

	return this;
}

$.relateColour = function (options){
	// defined defaults
	var settings = {
		value: 0,
		min: 0,
		max: 100,
		gradient: null
	}
	if (options)
		$.extend(settings,options);

	// percent value to set width of bar
	var percent = ((settings.value-settings.min)/(settings.max-settings.min))*100;

	if (settings.max == settings.min)
		percent = 0;

	// keep within range
	percent = Math.max(0,percent);
	percent = Math.min(100,percent);

	// decide on the new colour of the bar based on the gradient type
	var red = 0;
	var green = 0;
	var blue = 0;

	switch (settings.gradient){
		// green to yellow to  red
		case "negative":
			if (percent > 50){
				red = 255;
				green = 255 - (percent-50)*5.1;
			}
			else{
				green = 255;
				red = percent*5.1;
			}
		break;

		// red to yellow to green
		case "positive":
			if (percent > 50){
				green = 255;
				red = 255 - (percent-50)*5.1;
			}
			else{
				red = 255;
				green = percent*5.1;
			}
		break;

		// red to yellow to green to yellow  to red
		case "bipolar":
			if (percent < 25){
				green = percent*10.2;
				red = 255;
			}
			else if (percent < 50){
				green = 255;
				red = 255 - (percent-25)*10.2;
			}
			else if (percent < 75){
				green = 255;
				red = (percent-50)*10.2;
			}
			else{
				green = 255 - (percent-75)*10.2;
				red = 255;
			}
		break;

		// white always
		default:
			red = 255;
			blue = 255;
			green = 255;
	}

	// remove silly accuracy
	red = Math.round(red);
	blue = Math.round(blue);
	green = Math.round(green);

	return 'rgb('+red+','+green+','+blue+')';

}

})( jQuery );
