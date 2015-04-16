'use strict';

angular
    .module('directives')
    .directive('infoIconHoverTooltip', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {

                scope.popoverAdditionalClass = '';
                if (attrs.popoverAdditionalClass === 'rated-operational-voltage-popover'){
                    //warning : there is a white space before the string to separate it from the other classes !
                    scope.popoverAdditionalClass = ' rated-operational-voltage-popover';
                }

                // call the bootstrap's popover function to create the tooltip
                element.popover({
                    content: '<span class="info-icon-hover-tooltip">' + attrs.popoverHtml + '</span>',
                    container: attrs.popoverAppendToBody === 'body' ? 'body' : false,
                    html: true,
                    // opening delay in ms
                    delay: 250,
                    placement: attrs.popoverPlacement,
                    trigger: 'hover',
                    template: '<div class="info-popover popover' + scope.popoverAdditionalClass + '" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
                });
            }
        };
    });