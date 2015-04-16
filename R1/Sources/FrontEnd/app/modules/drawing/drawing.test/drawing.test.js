'use strict';

angular
    .module('drawing')
    .config(function($routeProvider) {
        $routeProvider.when('/test',
            {
                controller: 'drawing-test',
                templateUrl: 'modules/drawing/drawing.test/drawing.test.view.html'
            });
    })
    .controller('drawing-test', function($scope, $http, $timeout, _, searchSolutionService, apiHelper, apiConstants) {
        $scope.enclosures = [];
        $scope.selectedEnclosure = null;
        $scope.isLoading = false;
        $scope.deviceReference = '';

        $scope.ranges = ['All'];
        $scope.selectedRange = $scope.ranges[0];

        $scope.installations = ['All'];
        $scope.selectedInstallation = $scope.installations[0];

        $scope.doors = ['All'];
        $scope.selectedDoor = $scope.doors[0];

        $scope.loadPicture = function(enclosure){
            var parameter = getQueryParameter(enclosure);
            return searchSolutionService.generate3dModel(parameter, false, true).then(function(data){
                enclosure.picture = window.URL.createObjectURL(data);
            });
        };

        $scope.load3D = function(enclosure){
            $scope.isLoading = true;
            if ($scope.selectedEnclosure){
                $scope.selectedEnclosure.isSelected = false;
            }
            enclosure.isSelected = true;
            $scope.selectedEnclosure = enclosure;

            var parameter = getQueryParameter(enclosure);

            // load enclosure symbols if they are not yet defined
            if (!enclosure.symbols) {
                apiHelper.post(apiConstants.compositionGetSymbolsFromReferences, enclosure.product).then(function (mappings) {
                    enclosure.symbols = mappings[0].models;
                });
            }

            return searchSolutionService.generate3dModel(parameter, true, true, true).then(function(data){
                $scope.viewer3d.openCollada(data);
                $scope.isLoading = false;

                var dimensions = $scope.viewer3d.getDimensions();
                $scope.dimensions = 'Width: ' + Math.round(dimensions.x) + ' Height: ' + Math.round(dimensions.y) + ' Depth: ' + Math.round(dimensions.z);
            });
        };

        $scope.fillWithDevice = function() {
            $scope.enclosures = [];
            loadEnclosures().then(function() {
                loadPicture(0);
            });
        };

        function loadEnclosures() {
            return apiHelper.post(apiConstants.searchEnclosures, { filters: [] }).then(function (data) {
                for (var i = 0; i < data.length; i++) {
                    var enclosure = data[i];
                    var matchRange = $scope.selectedRange === $scope.ranges[0] || $scope.selectedRange === enclosure.range;
                    var matchInstallation = $scope.selectedInstallation === $scope.installations[0] || $scope.selectedInstallation === enclosure.installation;
                    var matchDoor = $scope.selectedDoor === $scope.doors[0] || $scope.selectedDoor === enclosure.door;

                    if (matchRange && matchInstallation && matchDoor) {
                        enclosure.references = '';
                        for (var j = 0; j < enclosure.product.length; j++) {
                            enclosure.references += enclosure.product[j] + ' ';
                        }
                        $scope.enclosures.push(enclosure);
                    }
                }
            });
        }

        function getQueryParameter(enclosure){
            return {
                enclosure: {product : enclosure.product},
                repeatDeviceReference: $scope.deviceReference
            };
        }

        function loadPicture(index){
            $scope.loadPicture($scope.enclosures[index]);
            if (index + 1 < $scope.enclosures.length) {
                loadPicture(++index);
            }
        }

        if ($scope.ranges.length === 1) {
            apiHelper.post(apiConstants.searchEnclosures, { filters: [] }).then(function (data) {
                for (var i = 0; i < data.length; i++) {
                    var enclosure = data[i];
                    if (!_.contains($scope.ranges, enclosure.range)) {
                        $scope.ranges.push(enclosure.range);
                    }
                    if (!_.contains($scope.installations, enclosure.installation)) {
                        $scope.installations.push(enclosure.installation);
                    }
                    if (!_.contains($scope.doors, enclosure.door)) {
                        $scope.doors.push(enclosure.door);
                    }
                }
            });
        }

        $scope.toggleCamera = function(){
            $scope.viewer3d.toggleCamera();
        };

        $scope.saveCompositionScript = function(){

            var parameter = getQueryParameter($scope.selectedEnclosure);

            searchSolutionService
                .generateCompositionScript(parameter)
                .then(function(data){
                    // todo JAS move this in an helper class !!!
                    // duplicate with save() function in shell-module.js
                    if (navigator.msSaveBlob) {
                        // IE 10+
                        var blob = new Blob([data], { 'type': 'application/xml;charset=utf-8;' });
                        navigator.msSaveBlob(blob, 'compositionScript.xml');
                    } else {
                        var element1 = angular.element('a#dlep');
                        // feature detection
                        // Browsers that support HTML5 download attribute
                        element1.attr({
                            href: 'data:application/xml;charset=utf-8,' + encodeURI(data),
                            target: '_blank',
                            download: 'compositionScript.xml'
                        })[0].click();
                    }
                });
        };
    });