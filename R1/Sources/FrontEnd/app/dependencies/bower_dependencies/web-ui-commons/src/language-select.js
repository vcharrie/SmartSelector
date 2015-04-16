'use strict';

angular.module('languageSelect', [
    // i18n
    'gettext',
    'languageService'
])
    .controller('languageController', ['$scope', '$sce', '$http', 'gettextCatalog', 'gettext', 'languageService', function ($scope, $sce, $http, gettextCatalog, gettext, languageService) {
        $scope.languages = languageService.getLanguages();
        
      //watch changes on languages
        $scope.$watch(function () {
            return languageService.getLanguages();
          },                       
           function(newVal, oldVal) {
          	if(newVal !== oldVal){
          		$scope.languages = newVal;
          	}
         }, true);
    }])
    .directive('languageSelect', ['$parse', function ($parse) {
        return {
            restrict: 'E',
            template: '<select><option ng-repeat="language in languages" value="{{language.iso}}" ng-selected="isLanguageSelected(language.iso)">{{language.name}}</option></select>',
            replace: true,
            controller: 'languageController'
        };
    }]);