'use strict';

/**
 * keyboardShortcutsService: Provides mechanism to use keyboard shortcuts on the application.
 */
angular.module('helpers').service('keyboardShortcutsService', function ($timeout) {

    /*
     * Service public interface
     */
    var service = {
        // Define all public properties

    };

    // Define all public methods
    service.onKeydown = function($event) {
        var TABKEY = 9;
        var RETURNKEY = 13;

        var e = $event;
        var shiftDepressed = e.shiftKey;
        var $target = $(e.target);
        var currentTabIndex = parseInt($target.attr('tabindex'));

        var nextTabIndex;

        switch (e.keyCode) {
            case TABKEY:
                //handle reverse tab shift+tab
                if (shiftDepressed) {
                    if (currentTabIndex > 1) {
                        nextTabIndex = currentTabIndex - 1;
                    }
                } else {
                    if ($target.attr('data-last-index')) {
                        nextTabIndex = 1;
                    } else {
                        nextTabIndex = currentTabIndex + 1;
                    }
                }

                e.preventDefault();

                break;
            case RETURNKEY:
                if (!$target.attr('data-allow-default-enter')) {
                    //Validate formular

                    e.preventDefault();
                    var clickValidatorElement = $('[data-click-validator="true"]');
                    if (clickValidatorElement.click) {
                        // do this outside the current $digest cycle
                        // focus the next element by tabindex
                        $timeout(function() {
                            clickValidatorElement.click();
                        });

                    }
                }
                break;
            default:
                break;
        }

        if (nextTabIndex !== undefined) {

            var nextTabElement = $('[tabindex=' + nextTabIndex + ']');

            if (nextTabElement.length > 0) {
                // do this outside the current $digest cycle
                // focus the next element by tabindex
                $timeout(function() {
                    nextTabElement.focus();
                });
            }
        }
    };

    return service;
});