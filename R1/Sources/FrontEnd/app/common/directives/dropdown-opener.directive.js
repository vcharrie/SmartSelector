'use strict';

/**
 * This attribute directive can be used on dropdown button to open the dropdown in the appropriate direction
 * to have the dropdown visible. Default is bottom, but if dropdown is not fully visible, it is up.
 */
angular
    .module('directives')
    .directive('dropdownOpener', function($timeout) {
        var onElementClicked = function(element, event) {
            //timeout is necessary so that the variable menuHeight is not 0
            $timeout(function() {
                //some approximation margin (10px)
                var approximationMargin = 10;

                // find the first parent that has the overflow CSS set to 'auto'
                // this is the div container that scrolls
                var scrollDivs = $(element).parents().filter(function() {
                    var current = $(this);
                    return current.css('overflow') === 'auto' || current.css('overflow-y') === 'scroll';
                });
                if (!scrollDivs || scrollDivs.length === 0) {
                    throw new Error('This directive requires a parent with either overflow=auto or overflow-y=scroll set in CSS');
                }
                var scrollDiv = $(scrollDivs[0]);
                var scrollDivTop = scrollDiv.offset().top ;
                var scrollDivBottomLimit = scrollDivTop + scrollDiv.height();

                //combo button (upside the menu)
                var comboButton = $(event.target);
                var comboButtonTop = comboButton.offset().top;

                //menu (the element to place in drop-down or drop-up)
                //as the click event can come from the modify-product-combo-btn element or from its child,
                //we need to handle the 2 cases
                var modifyProductComboBtnClass = 'dropdown-toggle';
                var modifyProductComboBtnElement;
                if (event.target.className.indexOf(modifyProductComboBtnClass) > -1) {
                    modifyProductComboBtnElement = comboButton;
                } else {
                    modifyProductComboBtnElement = comboButton.parents('.' + modifyProductComboBtnClass);
                }
                var menu = modifyProductComboBtnElement.nextAll('.dropdown-menu');
                var menuHeight = menu.height();
                var menuBottom = comboButtonTop + comboButton.height() + menuHeight;

                //finally the logic !
                if (menuBottom + approximationMargin < scrollDivBottomLimit) {
                    //normal case : drop-down menu is visible => drop-down
                    menu.removeClass('drop-up');
                } else if (comboButtonTop - menuHeight - approximationMargin > scrollDivTop) {
                    //bottom menu : drop-down menu is partially hidden, while a drop-up is completely visible => drop-up
                    menu.addClass('drop-up');
                } else {
                    //small screen resolution : menu can't be placed visible anywhere => drop-down
                    menu.removeClass('drop-up');
                }
            });
        };

        return {
            link: function(scope, element) {
                element.bind('click', function(event) {
                    onElementClicked(element, event);
                });
            }
        };
    });