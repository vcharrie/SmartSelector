'use strict';

angular
    .module('directives')
    .directive('imageHoverTooltip', function() {
        return {
            restrict: 'A',
            link: function(scope, element) {
                // wait until the image is loaded
                element.on('load', function(){
                    // call the bootstrap's popover function to create the tooltip
                    element.popover({
                        // append the popover to the body instead of the parent element to prevent cropping effect
                        container: 'body',
                        content: '<img class="img-hover-tooltip" src=\'' + this.src + '\'/>',
                        html: true,
                        // opening delay in ms
                        delay: 250,
                        placement: 'right',
                        trigger: 'hover'
                    });
                });
            }
        };
    });