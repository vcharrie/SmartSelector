'use strict';

angular
    .module('shared')
    .directive('customAutofocus', function() {
        return{
            restrict: 'A',

            link: function postlink(scope, element){

                //HACK AFT to set focus on last input
                setTimeout(function(){
                    element[0].focus();
                }, 0);
            }
        };
    });