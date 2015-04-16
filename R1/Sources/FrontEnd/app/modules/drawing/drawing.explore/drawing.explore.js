'use strict';

angular
    .module('drawing')
    .config(function($routeProvider) {
        $routeProvider.when('/explore',
            {
                controller: 'drawing-explore',
                templateUrl: 'modules/drawing/drawing.explore/drawing.explore.view.html'
            });
        $routeProvider.otherwise({ redirectTo: '/explore' });
    })
    .controller('drawing-explore', function($scope, $q, $timeout, _, dialogService, drawingService, apiHelper, apiConstants) {
        $scope.currentItem = null;
        $scope.references = [];
        $scope.drawings = [];
        $scope.showReferencePoints = false;
        $scope.withTexture = true;
        $scope.isLoaded = false;
        $scope.mode = 'reference';

        function Item(name, isReference) {
            this.name = name;
            this.symbols = [];
            this.isReference = isReference;
        }

        Item.prototype.hasReferencePoint = function() {
            var res = _.every(this.symbols, function(s) {
                return s.referencePoints && s.referencePoints.length > 0;
            });
            return res;
        };

        Item.prototype.hasSymbol = function () {
            if (this.symbols.length === 0) {
                return false;
            }
            /*return _.every(this.symbols, function (s) {
                return s.fileExists === true;
            });*/
            return true;
        };

        if (!drawingService.cache.references || !drawingService.cache.drawings) {
            // get all symbols
            var getSymbols = apiHelper.get(apiConstants.compositionGetSymbols).then(function (data) {
                for (var i = 0; i < data.length; i++) {
                    var item = new Item(data[i], false);
                    item.symbols.push({
                        name: data[i],
                        fileExists: true,
                        referencePoints: []
                    });
                    $scope.drawings.push(item);
                }
            });

            // get commercial references
            var getReferences = apiHelper.get(apiConstants.references).then(function (data) {
                var referenceNames = [];
                for (var i = 0; i < data.length; i++) {
                    referenceNames.push(data[i]);
                    $scope.references.push(new Item(data[i], true));
                }

                //HACK JRU : add CVS mounting plate reference
                referenceNames.push('PRA90075');
                $scope.references.push(new Item('PRA90075', true));

                // get commercial reference descriptions
                apiHelper.post(apiConstants.partsInfo, { language: 'ru-ru', partInfos: referenceNames, priceListId: 'RU' }).then(function(data) {
                    for (var i = 0; i < data.length; i++) {
                        var item = _.findWhere($scope.references, { name: data[i].partCode });
                        if (item) {
                            item.description = data[i].shortName;

                            // remove accessories
                            /*if(data[i].materialType === 'ACCESSORY'){
                                var index = $scope.references.indexOf(item);
                                if (index > -1) {
                                    $scope.references.splice(item, 1);
                                }
                            }*/
                        }
                    }
                });

                // get symbols for all commercial references
                return apiHelper.post(apiConstants.compositionGetSymbolsFromReferences, referenceNames).then(function (mappings) {
                    var symbols = {};

                    for (var j = 0; j < mappings.length; j++) {
                        var mapping = mappings[j];
                        var reference = _.findWhere($scope.references, { name: mapping.reference});

                        for (var k = 0; k < mapping.models.length; k++) {
                            var symbolName = mapping.models[k].name;
                            var fileExists = mapping.models[k].fileExists;
                            var symbol = symbols[symbolName];
                            if (!symbol) {
                                symbol = {
                                    name: symbolName,
                                    fileExists: fileExists,
                                    referencePoints: []
                                };
                                symbols[symbolName] = symbol;
                            }
                            if (!_.findWhere(reference.symbols, {name: symbolName})) {
                                reference.symbols.push(symbols[symbolName]);
                            }
                        }
                    }
                });
            });

            $q.all([getSymbols, getReferences]).then(function() {
                // all references and symbols are loaded, fetch all references points for all
                apiHelper.post(apiConstants.compositionGetReferencePoints, _.map($scope.drawings, function (item) { return item.name; })).then(function (mapping) {

                    // set reference points for all symbols
                    for(var i = 0; i < $scope.drawings.length; i++) {
                        var drawing = $scope.drawings[i];
                        if (mapping[drawing.name]) {
                            drawing.symbols[0].referencePoints = mapping[drawing.name];
                        }
                    }

                    // set reference points for all references
                    for(var j = 0; j < $scope.references.length; j++) {
                        var reference = $scope.references[j];
                        for (var k = 0; k < reference.symbols.length; k++) {
                            var symbol = reference.symbols[k];
                            if (mapping[symbol.name]) {
                                symbol.referencePoints = mapping[symbol.name];
                            }
                        }
                    }

                    drawingService.cache.references = $scope.references;
                    drawingService.cache.drawings = $scope.drawings;

                    $scope.isLoaded = true;
                });
            });

        } else {
            $scope.references = drawingService.cache.references;
            $scope.drawings = drawingService.cache.drawings;
            $scope.isLoaded = true;
        }

	    function load(uri, drawings){
			apiHelper.post(uri, { identifiers: drawings, showReferencePoints : $scope.showReferencePoints }).then(function(data){
                $scope.viewer3d.openCollada(data, 'http://10.195.163.217/');
				$scope.isLoading = false;

                var dimensions = $scope.viewer3d.getDimensions();
                $scope.dimensions = 'Width: ' + Math.round(dimensions.x) + ' Height: ' + Math.round(dimensions.y) + ' Depth: ' + Math.round(dimensions.z);

			}, function(err){
				dialogService.showWarning([err]);
				$scope.isLoading = false;
			});
	    }

        $scope.setMode = function(mode) {
            $scope.mode = mode;
            if (mode === 'reference') {
                $scope.items = $scope.references;
            } else if (mode === 'drawing') {
                $scope.items = $scope.drawings;
            }
        };

	    $scope.selectItem = function(item){
            if (item.symbols.length === 0 || _(item.symbols, { fileExists: false }).length === item.symbols.length) {
                // do not select the item if it has no symbol OR
                // if all symbols have the fileExists property set to false
                return;
            }

			$scope.currentItem = item;

			if(item !== '')
			{
				$scope.isLoading = true;
                var apiType = '';
                if (item.isReference) {
                    apiType = 'compositionExplodeReferences';
                } else {
                    apiType = 'compositionExplodeDrawings';
                }

                if ($scope.withTexture) {
                    apiType += 'V1.1';
                }

                load(apiConstants[apiType], [item.name]);
			}
	    };

		$scope.setStyle = function(type){
			switch(type)
			{
				case 'Ossature':
					return {'background-color':'rgb(255,255,0)'};
				case 'Montant':
					return {'background-color':'rgb(0,255,0)'};
				case 'Porte':
					return {'background-color':'rgb(0,255,255)'};
				case 'Male':
                case 'Male_Ajust':
					return {'background-color':'rgb(0,0,255)'};
				case 'Rail':
                case 'Rail_Ajust':
					return {'background-color':'rgb(255,0,0)'};
				case 'Nez':
					return {'background-color':'rgb(255,0,255)'};
				default:
					return {'background-color':'rgb(0,0,0)'};
			}
		};

        $scope.toggleCamera = function(){
            $scope.viewer3d.toggleCamera();
        };

        $scope.downloadCollada = function() {
            if ($scope.viewer3d.rowData && $scope.currentItem) {
                var data = $scope.viewer3d.rowData;
                var name = $scope.currentItem.name;

                // todo JAS move this in an helper class !!!
                var blob = new Blob([data], { 'type': 'text/xml;charset=utf-8;' });
                if (navigator.msSaveBlob) {
                    // IE 10+
                    navigator.msSaveBlob(blob, name + '.dae');
                } else {
                    var element = angular.element('<a>node</a>');
                    element.attr({
                        href:  window.URL.createObjectURL(blob),
                        target: '_blank',
                        download: name + '.dae'
                    })[0].click();
                }
            }
        };

        $scope.setMode('reference');

        $scope.getId = function(referencePoint){
            var id = referencePoint.id.replace(referencePoint.model,'');
            //id =  id.replace(referencePoint.type.toUpperCase(),'');
            return id;
        };
    });