angular.module('countrySelect', ['countryService'])
.controller('countryController', ['$scope','$sce','$http','$rootScope', 'countryService', function($scope,$sce,$http,$rootScope,countryService) {
	$scope.countries = countryService.getCountries();
}])
.directive('countrySelect', ['$parse', function($parse) {
	return {
		restrict: 'E',
		template: '<select><option ng-repeat="country in countries" value="{{country.iso}}" ng-selected="isCountrySelected(country.iso)" >{{country.name}}</option></select>',
		replace: true,
		controller: 'countryController'
	};
}]);