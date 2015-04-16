'use strict';

angular
    .module('enclosure')
    .directive('enclosureViewer', function() {
        return {
            restrict: 'E',
            scope: {
                solution: '=solution',
                changeState: '=state',
                selectionCallback: '=selectionCallback'
            },
            replace: true,
            templateUrl: 'modules/enclosure/enclosureViewer.view.html',
            controller: function ($scope, $element, $timeout, moment, Project, searchSolutionService) {
                $scope.error = null;
                $scope.isLoading = false;
                $scope.hasWebGL = true;
                $scope.display3d = true;
                $scope.hideDoor = false;
                $scope.isGeneratingPicture = false;

                function init() {

                    if ($scope.viewer3d && $scope.solution && !$scope.isLoading) {

                        $scope.isLoading = true;
                        $scope.hasWebGL = $scope.viewer3d.hasWebGL;
                        $scope.viewer3d.clearScene();

                        $timeout(function() {
                            if (!$scope.solution.collada) {
                                renderSolution(handleCollada, true);
                            } else {
                                handleCollada($scope.solution.collada);
                            }
                        });
                    }
                }

                $scope.$watch('viewer3d', function(){
                    init();
                });

                $scope.$watch('solution', function(){
                    init();
                });

                function elementSelected(data){
                  var firstReference = '';
                  data.forEach(function(node){
                    if(firstReference === '' && isVisible(node)) {
                      firstReference = node.userData.SE.reference;
                    }
                  });

                  if($scope.selectionCallback) {
                    $scope.selectionCallback(firstReference);
                  }
                }

                function isVisible(node){
                  var visible = false;
                  node.children.forEach(function(child) {
                    if(child.material && child.material.visible) {
                      visible = true;
                    }
                  });
                  return visible;
                }

                function handleCollada(collada){
                    $scope.solution.collada = collada;

                    if(!$scope.viewer3d) {
                        return;
                    }

                    // HACK JAS
                    // expose viewer on the input parameter of the directive
                    $scope.$parent.viewer = $scope.viewer3d;
                    $scope.viewer3d.openCollada(collada);

                    var box = $scope.viewer3d.getDimensions();
                    if($scope.solution.width === undefined || isNaN($scope.solution.width)) {
                        $scope.solution.width = Math.round(box.x);
                        $scope.solution.height = Math.round(box.y);
                        $scope.solution.depth = Math.round(box.z);
                    }

                    // Add callback method to mouse click event
                    $scope.viewer3d.setOnMouseClickOnObjectsCallback(elementSelected);

                    $scope.isLoading = false;
                    $scope.hasError = false;

                    $scope.viewer3d.handleResize();
                }

                function handleError() {
                    $scope.isLoading = false;
                    $scope.hasError = true;
                }

                function renderSolution(handleData, exportToCollada){
                    // generate 3D only if browser supports webgl
                    if (exportToCollada && $scope.viewer3d.hasWebGL || !exportToCollada) {
                        searchSolutionService
                            .generate3dModel({compositionScript: $scope.solution.compositionScript}, exportToCollada, false, !$scope.hideDoor)
                            .then(handleData, handleError);
                    } else {
                        $scope.isLoading = false;
                    }
                }

                $scope.onScreenshotGenerate = function(url, $event) {
                    if (!url) {
                        // screenshot generation starting
                        $scope.display3d = false;
                        $scope.isGeneratingPicture = true;
                    }
                    else {
                        // screenshot generation completed
                        $scope.display3d = true;
                        $scope.isGeneratingPicture = false;

                        if ($event.altKey && $event.ctrlKey) {
                            // special key mapping, download the composition script instead of the picture
                            saveCompositionScript();
                        } else {
                            var projectName = Project.current.name;
                            if (projectName) {
                                projectName += ' ';
                            }

                            var datetime =
                                moment().format('L').replace('/', '-') +
                                ' ' +
                                moment().format('h-mm');

                            // todo JAS move this in an helper class !!!
                            // duplicate with save() function in shell-module.js
                            if (navigator.msSaveBlob) {
                                // IE 10+
                                navigator.msSaveBlob(dataURItoBlob(url), projectName + datetime + ' frontview.png');
                            } else {
                                var element1 = angular.element('a#dlep');
                                // feature detection
                                // Browsers that support HTML5 download attribute

                                var elementToClick = element1.attr({
                                    href: url,
                                    target: '_blank',
                                    download: projectName + datetime + ' frontview.png'
                                })[0];

                                if(elementToClick !== undefined) {
                                    elementToClick.click();
                                }
                            }
                        }
                    }
                };

                function dataURItoBlob(dataURI) {
                    // convert base64/URLEncoded data component to raw binary data held in a string
                    var byteString;
                    if (dataURI.split(',')[0].indexOf('base64') >= 0)
                    {
                        byteString = atob(dataURI.split(',')[1]);
                    }
                    else
                    {
                        /* jshint ignore:start */
                        byteString = unescape(dataURI.split(',')[1]);
                        /* jshint ignore:end */
                    }

                    // separate out the mime component
                    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

                    // write the bytes of the string to a typed array
                    var ia = new Uint8Array(byteString.length);
                    for (var i = 0; i < byteString.length; i++) {
                        ia[i] = byteString.charCodeAt(i);
                    }

                    return new Blob([ia], {type:mimeString});
                }

                function saveCompositionScript() {
                    if (navigator.msSaveBlob) {
                        // IE 10+
                        var blob = new Blob([$scope.solution.compositionScript], { 'type': 'application/xml;charset=utf-8;' });
                        navigator.msSaveBlob(blob, 'compositionScript.xml');
                    } else {
                        var element1 = angular.element('a#dlep');
                        // feature detection
                        // Browsers that support HTML5 download attribute
                        element1.attr({
                            href: 'data:application/xml;charset=utf-8,' + encodeURI($scope.solution.compositionScript),
                            target: '_blank',
                            download: 'compositionScript.xml'
                        })[0].click();
                    }
                }
            }
        };
    });
