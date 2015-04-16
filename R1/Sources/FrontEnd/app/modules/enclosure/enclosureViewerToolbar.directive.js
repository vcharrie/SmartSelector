'use strict';

angular
    .module('enclosure')
    .directive('enclosureViewerToolbar', function(googleAnalyticsService, adminService, logger, gettextCatalog, $filter) {
        return {
            restrict: 'E',
            scope: {
                screenshotGenerate: '=onScreenshotGenerate',
                viewer: '=viewer',
                solution: '=solution'
            },
            templateUrl: 'modules/enclosure/enclosureViewerToolbar.directive.view.html',
            replace: true,
            link: function (scope) {

                var zoomValue = 120;
                var orbitValue = Math.PI/8;

                scope.setViewFront = function() {
                    scope.viewer.zoomExtents();
                };

                scope.disableTakeScreenshot = false;

                scope.takeScreenshot = function($event) {

                    // not supported by mobile devices
                    if (adminService.isMobile.any()) {
                        logger.error(gettextCatalog.getString('ERROR_NOT_YET_SUPPORTED_ON_MOBILE_DEVICE'), 'Function not yet supported', 'bom', true, null, { showUser: true });
                        return;
                    }

                    if (scope.screenshotGenerate) {
                        scope.screenshotGenerate();
                    }
                    scope.disableTakeScreenshot = true;
                    var caption = $filter('dimensions')(scope.solution);
                    scope.viewer.exportPicture('images/Logo_SE_Green_RGB-Screen.jpg', 166 * 2, 50 * 2, caption).then(function (url) {
                        // default action is to open a new window, but that can be overridden
                        if (scope.screenshotGenerate) {
                            scope.screenshotGenerate(url, $event);
                        } else {
                            window.open(url, '_blank');
                        }
                        scope.disableTakeScreenshot = false;
                    });
                    googleAnalyticsService.sendEvent('Application', 'Screenshot taken', 'Screenshot taken');
                };

                scope.zoomIn = function(){
                    scope.viewer.zoom(-zoomValue);
                };

                scope.zoomOut = function(){
                    scope.viewer.zoom(zoomValue);
                };

                scope.rotateLeft = function(){
                    scope.viewer.orbit({x : orbitValue});
                };

                scope.rotateRight = function(){
                    scope.viewer.orbit({x : -orbitValue});
                };

                scope.rotateUp = function(){
                    scope.viewer.orbit({y : orbitValue});
                };

                scope.rotateDown = function(){
                    scope.viewer.orbit({y : -orbitValue});
                };
            }
        };
    });
