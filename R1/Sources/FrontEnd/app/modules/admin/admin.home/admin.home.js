'use strict';
/*
 * admin home controller
 */
angular.module('admin')
    .config(function($routeProvider) {
        $routeProvider.when('/admin',
        {
            controller: 'admin-home',
            templateUrl: 'modules/admin/admin.home/admin.home.view.html'
        });
    })
    .controller('admin-home', function($scope, adminService) {
        var defaultWidth = 1024;
        var isFullscreen = $('.app-header').innerWidth() > defaultWidth;

        $scope.isAdmin = function() {
            return adminService.isAdmin;
		};

		$scope.toggleAdminMode = function(){
			adminService.setAdminMode(!adminService.isAdmin);
		};

        $scope.isDeveloper = function() {
            return adminService.isDeveloper;
        };

        $scope.toggleDeveloperMode = function(){
            adminService.setDeveloperMode(!adminService.isDeveloper);
        };

        $scope.isFullscreen = function() {
            return isFullscreen;
        };

        $scope.toggleFullscreenMode = function(){
           isFullscreen = !isFullscreen;
           if (isFullscreen) {
               $('.app-header, .app-footer, .app-shell, .app-main, .app-wizard').innerWidth('100%');
        }
           else {
               $('.app-header, .app-footer, .app-shell, .app-main, .app-wizard').innerWidth(defaultWidth);
           }
        };
    });
