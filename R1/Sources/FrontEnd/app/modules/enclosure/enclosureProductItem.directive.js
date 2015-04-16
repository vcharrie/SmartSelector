'use strict';

angular
    .module('enclosure')
    .directive('enclosureProductItem', function() {
        return {
            restrict: 'E',
            scope: {
                part: '=part'
            },
            replace: true,
            templateUrl: 'modules/enclosure/enclosureProductItem.view.html',
            controller: function ($scope, $element, $timeout) {
                $scope.$on('enclosurePartSelected', function (event, data) {
                    $scope.part.isSelected = $scope.part.part.partCode === data;

                    // Scroll to the selected item
                    if($scope.part.isSelected) {
                        $timeout(function(){
                            var productItemToPoint = $element;
                            var scrollDiv = $('.scrollable');
                            var scrollDivTop = scrollDiv.offset().top;
                            var scrollPresentPosition = scrollDiv.scrollTop();
                            scrollDiv.animate({scrollTop : scrollPresentPosition + productItemToPoint.offset().top - scrollDivTop}, 'fast');
                        });
                    }
                });
            }
        };
    });
