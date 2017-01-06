'use strict';
/** ANGULAR TOOLTIPS
 *
 *		I'm not using AngularJS by design - why? Because I don't want
 *       to assign new scopes or events for every element, this will
 *		 be pretty damn lightweight in action:
 *
 *			<div fast-tip="Hello World!"></div>
 *
 *      CSS Note
 *
 *          To render these correctly, be sure to use _toolip.scss
 *           which is available as part of our CSS framework.
 *
 *		@author   David "oodavid" King
 */
(function(){
	// When we mouseover
	var toolTipEnter = function(e){
		var target    = $(e.target).closest('[ng-tooltip]');
		var tooltip   = $('#ngTooltip');
		var text      = target.attr('ng-tooltip');
		var placement = target.attr('ng-tooltip-placement') || 'top'; // Defaults to top :)
		var offset    = target.offset();
		// Do nothing if we're in a disabled DOM tree
		if(target.closest('[disabled]').length){
			toolTipLeave();
			return;
		}
		// Reset with text immediately, then we can access the rendered tooltip dimensions
		text = text.replace(/\\n/g, '\n'); // Make sure "\\n" are converted to "\n"
		$('#ngTooltip').text(text).removeClass('top right bottom left').css({ left: 0, top: 0 }).show();
		// Magic placement
		if(placement === 'top' || placement === 'bottom'){
			var centreX = offset.left+(target.outerWidth()/2);
			var left    = centreX-(tooltip.outerWidth()/2);
			var right   = centreX+(tooltip.outerWidth()/2);
			var top     = offset.top - tooltip.outerHeight();
			if(left < 0){
				placement = 'right';
			} else if(right > $('body').innerWidth()){
				placement = 'left';
			} else if(placement == 'top' && top < 0){
				placement = 'bottom';
			}
		}
		// Now position
		if(placement === 'bottom'){
			$('#ngTooltip')
				.css({
					left: offset.left-(tooltip.outerWidth()/2)+(target.outerWidth()/2),
					top:  offset.top+target.outerHeight()
				});
		} else if(placement === 'right'){
			$('#ngTooltip')
				.css({
					left: offset.left+target.outerWidth(),
					top:  offset.top-(tooltip.outerHeight()/2)+(target.outerHeight()/2)
				});
		} else if(placement === 'left'){
			$('#ngTooltip')
				.css({
					left: offset.left-tooltip.outerWidth(),
					top:  offset.top+(target.outerHeight()/2)-(tooltip.outerHeight()/2)
				});
		} else if(placement === 'top'){
			$('#ngTooltip')
				.css({
					left: offset.left-(tooltip.outerWidth()/2)+(target.outerWidth()/2),
					top:  offset.top-tooltip.outerHeight()
				});
		} else {
			$('#ngTooltip').hide(); // We shouldn't get here
		}
		// Style
		target.addClass('has-tooltip');
		$('#ngTooltip').addClass(placement);
	};
	// When we mouseleave
	var toolTipLeave = function(){
		$('#ngTooltip').hide();
		$('.has-tooltip').removeClass('has-tooltip');
	};
	// For speed, tooltips are "pure" jQuery.
	$(document).ready(function(e){
		$('body').append('<div id="ngTooltip"></div>');
		$('body').on('mouseenter', '[ng-tooltip]', toolTipEnter);
		$('body').on('mouseleave', '[ng-tooltip]', toolTipLeave);
		$('body').on('mousedown',                   toolTipLeave);
	});
	// To make sure tooltips are correctly tidied up, we need to hide the tooltip if the parent is destroyed
	angular
		.module('ngTooltips', [])
		.directive('ngTooltip', function() {
			return {
				restrict: 'A',
				link: function(scope, element, attrs){
					scope.$on("$destroy", function(){
						if(element.hasClass('has-tooltip')){
							toolTipLeave();
						}
					});
				}
			};
		});
})();