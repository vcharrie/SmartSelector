'use strict';

/**
 *
 */
angular.module('viewer3d')
.controller('viewer3dController', ['$scope', '$rootScope', '$sce', function($scope, $rootScope, $sce) {
	/*
	 * Init
	 */
	function init() {
	}

	init();
}])
.directive('seViewer3d', ['ThreejsViewer', function (ThreejsViewer) {

	function createViewer(element) {
		var host = $(element).find('.viewer3d-host');
		var viewer = new ThreejsViewer(host);

		if (viewer.hasWebGL) {
			$('.viewer3d-missing-webgl').hide();
			viewer.clearScene();
		} else {
			$('.viewer3d-host').hide();
		}
		$(window).on('resize',viewer.handleResize);

		return viewer;
	}


	return {
		restrict: 'E',
		templateUrl: 'viewer3d-directive.view.html',
		controller: 'viewer3dController',
		replace: true,
		link: function(scope, element){

			scope.viewer3d = createViewer(element);

			scope.$on('$destroy', function () {
				$(window).off('resize',scope.viewer3d.handleResize);
				scope.viewer3d.dispose();
			});
		}
	};
}])
.provider('$viewer3d', ['$provide', function $viewer3dProvider ($provide) {
	/*
	 * The following code must be called to configure the callback functions of the search bar (text changed, search button clicked, etc)
	 * var app = angular.module('viwer3dSearcbarDirective, function($viewer3dProvider) {
	 * 		$viewer3dProvider.options({ ... });
	 * });
	 *
	 */
	this.options = function(value) {
//		Don't forget to add the "Directive" suffix added to the actual name when using a decorator  (actual name was 'viewer3d')
		$provide.decorator('seViewer3dDirective', ['$delegate', '$controller',  function($delegate, $controller) {
			var directive = $delegate[0];
			var controllerName = directive.controller;
			directive.controller = ['$scope', function($scope) {
				angular.extend(this, $controller(controllerName, {$scope: $scope}));

				$scope.webGLNotAvailableErrorMessage = value.webGLNotAvailableErrorMessage;

			}];

			return $delegate;
		}]);
	};

	this.$get = function viewer3dFactory() {
		return new Viewer3d(options);
	};

}])
;
