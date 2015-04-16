'use strict';

/**
 * switchboard-distribution controller
 */
angular.module('switchboardOrganisation', ['ngRoute', 'business', 'tracking', 'directives', 'helpers'])
    .config(function ($routeProvider) {
        $routeProvider.when('/switchboard-organisation',
            {
                controller: 'switchboardOrganisation',
                templateUrl: 'modules/switchboard-organisation/switchboard-organisation.view.html',
                resolve: {
                    factory: ['projectService', '$location', function (projectService, $location) {
                        return projectService.checkProjectExists(function () {
                            $location.path('/');
                        });
                    }]
                }
            });
    });