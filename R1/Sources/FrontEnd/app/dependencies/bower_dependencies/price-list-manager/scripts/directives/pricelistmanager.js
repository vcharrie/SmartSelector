'use strict';

/**
 * @ngdoc directive
 * @name srcApp.directive:priceListManager
 * @description # priceListManager
 */
angular.module('priceListManager', ['ngCookies','angularFileUpload','priceListServiceModule','ui.bootstrap','gettext','pricingUiComponentTemplates','angularSpinner'])
.directive('priceListManager', ['usSpinnerService', '$cookies', '$upload', 'priceListService','$modal','gettextCatalog', function(usSpinnerService, $cookies, $upload, priceListService,$modal,gettextCatalog) {
	return {
		scope : {
			selectionCallback: '&',
			cancelCallback: '&',
			tableHeightInPixels: '@?'
		},
		templateUrl : 'views/price-list-manager.view.html',
		restrict : 'EA',
		link : function postLink(scope, element, attrs) {
			
			// style input file
			$("#plm-inputFile").filestyle({buttonText: gettextCatalog.getString("Open")});
			
			/* SCOPE VARIABLES */
			scope.tableHeightInPixels = scope.tableHeightInPixels || '360px';
			angular.element('.price-list-content').css('height',scope.tableHeightInPixels);
			
			scope.startSpinner = function() {
				scope.loading = true;
				usSpinnerService.spin('spinner-0');
			}
			
			scope.stopSpinner = function() {
				scope.loading = false;
				usSpinnerService.stop('spinner-0');
			}
			
			scope.returnToHome = function() {
				scope.currentStep = 0;
				scope.httpError = false;
				scope.httpErrorMessage = '';
				scope.editionMode = false;
				scope.currentListSelectedIndex = undefined;
				scope.currentListSelected = undefined;
				scope.currentCurrency = undefined;
				scope.listDescription = "";
			}
			
			scope.listDescription = "";
			scope.editionMode = false;
			
			// set currencies
			scope.currencies = [
			    {code:'ARS',symbol:'$'},
			    {code:'BOB',symbol:'Bs'},
			    {code:'COP',symbol:'$'},
			    {code:'CLP',symbol:'$'},
			    {code:'DKK',symbol:'dkk'},
			    {code:'EUR',symbol:'€'},
			    {code:'GBP',symbol:'£'},
			    {code:'KRW',symbol:'￦'},
			    {code:'KZT',symbol:'₸'},
			    {code:'MXN',symbol:'$'},
			    {code:'PEN',symbol:'S/'},
			    {code:'RON',symbol:'lei'},
			    {code:'RUB',symbol:'Pуб'},
			    {code:'SAR',symbol:'ر.س'},
			    {code:'SEK',symbol:'sek'},
			    {code:'USD',symbol:'$'},
			    {code:'VND',symbol:'₫'},
			    {code:'ZAR',symbol:'zar'}
			];	
			
			// List of steps in the wizard
			scope.steps = [0,1,2,3];
			
			// Current step
			scope.currentStep = 0;
			
			// Is file loading ?
			scope.fileloaded = false;
			
			// List of sheets name of the file
			scope.sheets = [];
			
			// HTTP errors
			scope.httpError = false;
			scope.httpErrorMessage = '';
			
			/* LISTS MANAGEMENT */
			
			// Displays public and user's lists
			scope.getLists = function() {
				scope.httpError = false;
				scope.httpErrorMessage = '';
				scope.priceLists = [];
				priceListService.getCountriesList()
				.then(function(datas){
					scope.addToList(datas);
				},function(data){
					scope.httpError = true;
					if (data && data.error)
						scope.httpErrorMessage = data.error;
				})
				.then(priceListService.getUserLists()
					.then(function(data){
						scope.addToList(data.data);
						scope.checkPreferences();
						scope.stopSpinner();
					},function(data){
						scope.stopSpinner();
						scope.httpError = true;
						if (data && data.data && data.data.error)
							scope.httpErrorMessage = data.data.error;
				}));
			}
			
			scope.checkPreferences = function() {
				if ($cookies.seSelectedPriceList) {
					for (var i=0; i<scope.priceLists.length; i++) {
						var list = scope.priceLists[i];
						if ($cookies.seSelectedPriceList == list.id) {
							scope.listSelection(i);
							break;
						}
					}
				}
			};
			
			// callback function adding list retrieved by http request
			scope.addToList = function(lists) {
				angular.forEach(lists, function(list) {
					scope.priceLists.push(list);
				});
			}
			
			// When user has clicked on a list
			scope.listSelection = function(idx) {
				if (!scope.loading){
					scope.currentListSelectedIndex = idx;
					scope.currentListSelected = scope.priceLists[idx];
				}
			}
			
			// When user has selected a list and has clicked on OK button
			scope.onListValidation = function(){
				if (!scope.loading){
					$cookies.seSelectedPriceList = scope.currentListSelected.id;
					scope.selectionCallback({listSelected:scope.currentListSelected});
				}
			}
			
			// When user clicks on cancel button
			scope.onListCancel = function(){
				if (!scope.loading){
					scope.currentListSelectedIndex = undefined;
					scope.currentListSelected = undefined;
					scope.cancelCallback();
				}
			}
			
			// When user wants to delete a list
			scope.deleteList = function(index) {
				if (!scope.loading){
					scope.startSpinner();
					scope.httpError = false;
					scope.httpErrorMessage = '';
					var listId = scope.priceLists[index].id;
					priceListService.deleteList(listId)
					.success(function(){
						scope.priceLists.splice(index, 1);
						scope.currentListSelectedIndex = undefined;
						scope.currentListSelected = undefined;
						scope.stopSpinner();
					})
					.error(function(data){
						scope.httpError = true;
						if (data && data.error)
							scope.httpErrorMessage = data.error;
						scope.currentListSelectedIndex = undefined;
						scope.currentListSelected = undefined;
						scope.stopSpinner();
					});
				}
			}
			
			// When user wants to edit a list
			scope.editList = function(index) {
				if (!scope.loading){
					var list = scope.priceLists[index];
					var modalInstance = $modal.open({
				      templateUrl: 'editListContent.html',
				      controller: 'editListModalCtrl',
				      resolve: {
				        item: function () {
				          return list;
				        }
				      }
				    });
					
					modalInstance.result.then(function (list) {
						scope.currentListSelectedIndex = undefined;
						scope.currentListSelected = undefined;
				    }, function () {
				    	scope.currentListSelectedIndex = undefined;
						scope.currentListSelected = undefined;
				    });
				}
			}
			
			// When user wants to import a file for a list
			scope.importRevisionForList = function(index){
				if (!scope.loading){
					var list = scope.priceLists[index];
					scope.currentListSelected = list;
					scope.listDescription = list.description;
					var found = false;
					  var i = 0;
					  
					  while (!found && i < scope.currencies.length) {
						  if (scope.currencies[i].code == list.currencyCode) {
							  scope.currentCurrency = scope.currencies[i];
						  }
						  i++;
					  }
					scope.editionMode = true;
					scope.goTo(1);
				}
			};
			
			scope.startSpinner();
			scope.getLists();
			
			/* WIZARD MANAGEMENT */
			
			// function called when the user selects a file
			scope.fileChanged = function(files) {
				// Reset variables
				scope.fileloaded = false;
				scope.sheets = [];
				
				// Read the file
		        scope.excelFile = files[0];
		        var reader = new FileReader();
		        scope.listName = scope.excelFile.name;
		        reader.onload = function(e) {
		        	var arraybuffer = e.target.result;
		        	var data = new Uint8Array(arraybuffer);
		        	
		        	
		        	var arr = new Array();
		        	for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
		        		var bstr = arr.join("");
		        		
	        		var re = /(?:\.([^.]+))?$/;
	        		var ext = re.exec(scope.excelFile.name)[1];
	        		if (ext.toLowerCase()==="xls") {
	        			scope.workbook = XLS.read(bstr, {type: 'binary'});
	        		} else {
	        			scope.workbook = XLSX.read(bstr, {type: 'binary'});
			        }
		          
		          scope.sheets = scope.workbook.SheetNames;
		          scope.fileloaded = true;
		          scope.$apply();
		        };
		        reader.readAsArrayBuffer(scope.excelFile);
			}
			
			scope.goTo = function(step) {
				if (!scope.httpError) {
					scope.httpError = false;
					scope.httpErrorMessage = '';
					scope.currentStep = step;
					if (scope.currentStep == 0) {
						$(":file").filestyle('clear');
						scope.returnToHome();
					}
					if (scope.currentStep == 3) {
						scope.setHeaders();
					}
					if (scope.currentStep == 4) {
						scope.preview();
					}
				}
			}
			
			scope.preview = function() {
				var maxRows =  scope.nbRows - scope.headerRowNumber;
				maxRows = Math.min(5, maxRows);
				scope.previewList = [];
				for (var i=scope.headerRowNumber; i<=maxRows; i++) {
					var refAddress = XLS.utils.encode_cell({c:scope.refCol.col, r:i});
					var priceAddress = XLS.utils.encode_cell({c:scope.priceCol.col, r:i});
					var ref = "";
					var price = "";
				
					if (scope.workbook.Sheets[scope.currentSheet][refAddress]) {
						ref = scope.workbook.Sheets[scope.currentSheet][refAddress].v;
					}
					if (scope.workbook.Sheets[scope.currentSheet][priceAddress]) {
						price = scope.workbook.Sheets[scope.currentSheet][priceAddress].v;
					}
					var previewElement = {ref:ref,price:price};
					scope.previewList.push(previewElement);
				}
			}
			
			scope.sheetHasChanged = function() {
				if (scope.currentSheet) {

					scope.currentSheetIndex = 0;
					
					for (var i=0; i<scope.sheets.length; i++ ) {
						if (scope.sheets[i] === scope.currentSheet) {
							scope.currentSheetIndex = i;
							break;
						}
					}
					var ranges = scope.workbook.Sheets[scope.currentSheet]['!ref'].split(":");
					var start = ranges[0];
					var end = ranges[1];
					var firstRow = XLS.utils.decode_cell(start).r;
					var firstCell = XLS.utils.decode_cell(start).c;
					var lastCell = XLS.utils.decode_cell(end).c;
					scope.nbRows = XLS.utils.decode_cell(end).r + 1;
					
					scope.headerRowNumber = firstRow + 1;
					scope.setHeaders();
					
				} else {
					scope.headerRowNumber = undefined
				}
			}
			
			scope.setHeaders = function() {
				var ranges = scope.workbook.Sheets[scope.currentSheet]['!ref'].split(":");
				var start = ranges[0];
				var end = ranges[1];
				var firstRow = XLS.utils.decode_cell(start).r;
				var firstCell = XLS.utils.decode_cell(start).c;
				var lastCell = XLS.utils.decode_cell(end).c;
				scope.nbRows = XLS.utils.decode_cell(end).r + 1;
				
				scope.headers =[];
				
				for (var i=firstCell; i<=lastCell; i++) {
					var address = XLS.utils.encode_cell({c:i, r:scope.headerRowNumber-1});
						if(scope.workbook.Sheets[scope.currentSheet][address]) {
							var header = {col:i,value:scope.workbook.Sheets[scope.currentSheet][address].v};
							scope.headers.push(header);
						}
				}
			}
			
			scope.import = function() {
				scope.startSpinner();
				scope.httpError = false;
				scope.httpErrorMessage = '';
				
				var data = {
						sheetIdx: scope.currentSheetIndex,
						contentFirstRowIdx: scope.headerRowNumber,
						priceColIdx: scope.priceCol.col,
						referenceColIdx: scope.refCol.col
				};
				
				if (scope.editionMode) {
					scope.uploadFile(scope.currentListSelected,data);
				} else {
					var list = {
							name: scope.listName,
							description: scope.listDescription,
							type: 'USER',
							currencyCode: scope.currentCurrency.code
							
					};
					scope.createList(list,data);
				}
				
			};
			
			scope.createList = function(list,data) {
				priceListService.createList(list).
				then(function(location){
					var listId = location.substring(location.lastIndexOf("/") +1);
					list.id = listId;
					scope.uploadFile(list,data);
				}, function(data){
					scope.stopSpinner();
					scope.httpError = true;
					if (data && data.error)
						scope.httpErrorMessage = data.error;
				});
			}
			
			scope.uploadFile = function(list,data){
				priceListService.uploadFile(scope.excelFile,list.id,data)
				.then(function(){
					if (!scope.editionMode)
						scope.priceLists.push(list);
					scope.returnToHome();
					scope.stopSpinner();
				}, function(data) {
					scope.httpError = true;
					if (data && data.data)
						scope.httpErrorMessage = data.data;
					scope.stopSpinner();
				});
			}
		}
	};
}])
.controller('editListModalCtrl',['$scope','$modalInstance','priceListService','usSpinnerService','item', function ($scope, $modalInstance, priceListService, usSpinnerService, item) {
	  $scope.list = angular.copy(item);
	  
	  $scope.httpError = false;
	  $scope.httpErrorMessage = '';
	  
	  $scope.startSpinner = function() {
		  $scope.loading = true;
		  usSpinnerService.spin('spinner-1');
	  }
		
	  $scope.stopSpinner = function() {
		  $scope.loading = false;
		  usSpinnerService.stop('spinner-1');
	  }
	  
	  $scope.currencies = [
		    {code:'ARS',symbol:'$'},
		    {code:'BOB',symbol:'Bs'},
		    {code:'COP',symbol:'$'},
		    {code:'CLP',symbol:'$'},
		    {code:'DKK',symbol:'dkk'},
		    {code:'EUR',symbol:'€'},
		    {code:'GBP',symbol:'£'},
		    {code:'KRW',symbol:'￦'},
		    {code:'KZT',symbol:'₸'},
		    {code:'MXN',symbol:'$'},
		    {code:'PEN',symbol:'S/'},
		    {code:'RON',symbol:'lei'},
		    {code:'RUB',symbol:'Pуб'},
		    {code:'SAR',symbol:'ر.س'},
		    {code:'SEK',symbol:'sek'},
		    {code:'USD',symbol:'$'},
		    {code:'VND',symbol:'₫'},
		    {code:'ZAR',symbol:'zar'}
		];	
	  var found = false;
	  var i = 0;
	  
	  while (!found && i < $scope.currencies.length) {
		  if ($scope.currencies[i].code == item.currencyCode) {
			  $scope.list.currencyCode = $scope.currencies[i].code;
		  }
		  i++;
	  }

	  $scope.ok = function () {
		  $scope.startSpinner();
		  $scope.httpError = false;
		  $scope.httpErrorMessage = '';
		  priceListService.updateList($scope.list)
		  .then(function(){
			  $scope.stopSpinner();
			  item.name = $scope.list.name;
			  item.description = $scope.list.description;
			  item.currencyCode = $scope.list.currencyCode;
			  $modalInstance.close(item);
		  },function(data){
			  $scope.stopSpinner();
			  $scope.httpError = true;
				if (data && data.data && data.data.error)
					$scope.httpErrorMessage = data.data.error;
		  });
		  
	  };

	  $scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	  };
	}]);
