'use strict';

angular
    .module('directives')
    .directive('layers', function() {
        return {
            restrict: 'E',
            scope: {
                viewer: '=viewer'
            },
            templateUrl: 'common/directives/layers.directive.view.html',
            replace: false,
            controller: function ($scope, gettextCatalog, _) {

                // Mapping SymbolType/Layer
                var mapping = {};
                mapping.Enclosure =         'Enclosure';
                mapping.Busbar =            'Busbar';
                mapping.SupportFrame =      'Enclosure';
                mapping.Door =              'Door';
                mapping.FrontPlate =        'FrontPlate';
                mapping.MountingPlate =     'MountingPlate';
                mapping.Rail =              'Rail';
                mapping.BackRail =          'Rail';
                mapping.DistributionBlock = 'Device';
                mapping.Device =            'Device';
                mapping.Roof =              'Enclosure';
                mapping.Vigi =              'Device';
                mapping.Handle =            'Device';
                mapping.Support =           'Busbar';
                mapping.Unknown =           'Enclosure';

                // Layers
                var sequence = {};
                sequence.Door =             0;
                sequence.FrontPlate =       1;
                sequence.Device =           2;
                sequence.Rail =             3;
                sequence.MountingPlate =    4;
                sequence.Busbar =           5;
                sequence.Enclosure =        6;

                // sort layers according to specified sequence
                function sortLayers(layers) {
                    $scope.layers = _.sortBy(layers, function(layer){
                        return sequence[layer.name];
                    });
                }

                function loadLayers() {

                    $scope.isLoading = true;

                    // keep dropdown open on click
                    $('.dropdown-menu').click(function(e) {
                        e.stopPropagation();
                    });

                    var layers = [];
                    _.each($scope.viewer.symbolTypes, function (symbolType) {
                        var layer = mapping[symbolType];
                        if(!layer) {
                            layer = 'Enclosure';
                        }
                        if(!_.findWhere(layers, {name : layer})){
                            layers.push({
                                name: layer,
                                selected: true,
                                translationKey: gettextCatalog.getString('enclosure-layer-' + layer)
                            });
                        }
                    });

                    // sort layers according to specified sequence
                    sortLayers(layers);

                    $scope.$watch('layers|filter:{selected:true}', function (nv) {
                        var selection = nv.map(function (layer) {

                            var selectedSymbolTypes = [];
                            for(var symbolType in mapping){
                                if(mapping.hasOwnProperty(symbolType) && mapping[symbolType] === layer.name) {
                                    selectedSymbolTypes.push(symbolType);
                                }
                            }

                            return selectedSymbolTypes;
                        });

                        selection = [].concat.apply([],selection);
                        $scope.viewer.selectSymbolTypes(selection);

                    }, true);

                    $scope.isLoading = false;
                }

                $scope.$watch('viewer', function(){
                    if ($scope.viewer && $scope.viewer.scene) {
                        $scope.viewer.scene.addEventListener('loaded', loadLayers, false);
                    }
                    loadLayers();
                });

                $scope.$on('$destroy', function () {
                    if($scope.viewer && $scope.viewer.scene) {
                        $scope.viewer.scene.removeEventListener('loaded', loadLayers, false);
                    }
                });
            }
        };
    });