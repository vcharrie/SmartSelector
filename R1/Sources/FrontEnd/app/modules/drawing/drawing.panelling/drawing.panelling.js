'use strict';

angular
    .module('drawing')
    .config(function($routeProvider) {
        $routeProvider.when('/panelling',
            {
                controller: 'drawing-panelling',
                templateUrl: 'modules/drawing/drawing.panelling/drawing.panelling.view.html'
            });
    })
    .controller('drawing-panelling', function($scope, $q, $http, $timeout, _, searchSolutionService, drawingService, apiHelper, apiConstants) {
        $scope.enclosure = null;
        $scope.results = [];
        $scope.selectedEnclosure = null;
        $scope.isLoading = false;
        $scope.ranges = [];
        $scope.combinations = ['ENC','DUCT'];
        $scope.selectedCombination = $scope.combinations[0];
        $scope.deviceReferences = [];

        if (!drawingService.cache.deviceReferences) {

            // get commercial references
            apiHelper.get(apiConstants.electricalReferences).then(function (data) {

                $scope.deviceReferences = data;

                // get symbols for all commercial references
                apiHelper.post(apiConstants.compositionGetSymbolsFromReferences, _.uniq(_.flatten(data))).then(function (mappings) {
                    var symbols = [];
                    var productsToRemove = [];

                    var addSymbols = function(reference) {
                        productSymbols.push(_.map(_.find(mappings, function (m) {
                            return m.reference === reference;
                        }).models, function(model) { return model.name;}));
                    };

                    for(var i=0; i< $scope.deviceReferences.length; i++){

                        var product = $scope.deviceReferences[i];
                        var productSymbols = [];

                        for(var j=0; j<product.length; j++) {
                            addSymbols(product[j]);
                        }

                        var productSymbolsString = productSymbols.join('_');

                        if(!_.contains(symbols, productSymbolsString)){
                            symbols.push(productSymbolsString);
                        } else {
                            productsToRemove.push(product);
                        }
                    }

                    $scope.deviceReferences = _.difference($scope.deviceReferences, productsToRemove);

                    drawingService.cache.deviceReferences = $scope.deviceReferences;
                    $scope.isLoaded = true;
                });
            });
        } else {
            $scope.deviceReferences = drawingService.cache.deviceReferences;
            $scope.isLoaded = true;
        }

        $scope.loadPicture = function(reference){
            var parameter = getQueryParameter(reference);
            return searchSolutionService.generate3dModel(parameter, false, true).then(function(data){
                $scope.results.push(
                    {references : $scope.enclosure.references,
                        device : reference,
                        picture : window.URL.createObjectURL(data)});
            }, function (){
                $scope.results.push({references : $scope.enclosure.references, device : reference, picture : 'dummy'}); }
            );
        };

        $scope.load3D = function(enclosure){
            $scope.isLoading = true;
            if ($scope.selectedEnclosure){
                $scope.selectedEnclosure.isSelected = false;
            }
            enclosure.isSelected = true;
            $scope.selectedEnclosure = enclosure;

            var parameter = getQueryParameter(enclosure.device);

            // load enclosure symbols if they are not yet defined
            if (!$scope.enclosure.symbols) {
                apiHelper.post(apiConstants.compositionGetSymbolsFromReferences, $scope.enclosure.product).then(function (mappings) {
                    $scope.enclosure.symbols = mappings[0].models;
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
            $scope.enclosure = null;
            $scope.results = [];
            loadEnclosures().then(function() {
                loadPicture(0);
            });
        };

        function loadEnclosures() {
            return apiHelper.post(apiConstants.searchEnclosures, { filters: [] }).then(function (data) {
                for (var i = 0; i < data.length; i++) {

                    /* jshint ignore:start */
                    // "combination_UnderscoredSrc" is a value from the database. I want jshint to ignore it

                    var enclosure = data[i];
                    var matchRange = $scope.selectedRange === enclosure.range;
                    var matchCombination = enclosure.range !== 'PRISMA_G' || enclosure.combination_UnderscoredSrc.indexOf($scope.selectedCombination) === 0;
                    var matchDoor = 'WITHOUT' === enclosure.door && (enclosure.doorDuct === undefined || 'WITHOUT' === enclosure.doorDuct);
                    if(!matchDoor) {
                        matchDoor = enclosure.door === undefined || ('TRANSPARENT' === enclosure.door && 'WITHOUT' === enclosure.doorDuct);
                    }

                    if (matchRange && matchCombination && matchDoor) {
                        enclosure.references = '';
                        for (var j = 0; j < enclosure.product.length; j++) {
                            enclosure.references += enclosure.product[j] + ' ';
                        }
                        $scope.enclosure = enclosure;
                        break;
                    }

                    /* jshint ignore:end */
                }
            });
        }

        function getQueryParameter(reference){
            return {
                enclosure: {product : $scope.enclosure.product},
                repeatDeviceReference: reference
            };
        }

        function loadPicture(index){
            $scope.loadPicture($scope.deviceReferences[index].join('_'));
            if (index + 1 < $scope.deviceReferences.length) {
                loadPicture(++index);
            }
        }

        if ($scope.ranges.length === 0) {
            apiHelper.post(apiConstants.searchEnclosures, { filters: [] }).then(function (data) {
                for (var i = 0; i < data.length; i++) {
                    var enclosure = data[i];
                    if (!_.contains($scope.ranges, enclosure.range)) {
                        $scope.ranges.push(enclosure.range);
                    }
                }
                $scope.selectedRange = $scope.ranges[0];
            });
        }

        $scope.toggleCamera = function(){
            $scope.viewer3d.toggleCamera();
        };

        $scope.saveCompositionScript = function(){

            var parameter = getQueryParameter($scope.selectedEnclosure.device);

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