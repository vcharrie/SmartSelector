'use strict';

/**
 * @ngdoc directive
 * @name bomUiApp.directive:bomDirective
 * @description # bomDirective
 */
angular.module('bomUi',['ngCookies','bomModel','bomFilters','bomServices','gettext','bomUiComponentTemplates','angularSpinner'])
.directive('bomDirective', ['$cookies','$timeout','Bom','BomColumn','BomGroup','BomProduct','BomTag','BomContent','bomManagementService','$filter','gettextCatalog','usSpinnerService',
                           function($cookies,$timeout,Bom,BomColumn,BomGroup,BomProduct,BomTag,BomContent,bomManagementService,$filter,gettextCatalog,usSpinnerService) {
	return {
		restrict : 'EA',
		scope: {
          groupingByTag: '=?',
          heightInPixels: '@?',
          scrollable: '=?'
        },
		templateUrl : 'views/bom-ui.view.html',
		link : function postLink(scope, elm) {
			scope.scrollable = scope.scrollable ? scope.scrollable == true : false;
			
			if(scope.scrollable == true) {
				$('.fixed-header').addClass('fixed-header-scrollable');
				$('.bom-scrollable').addClass('bom-scrollable-scrollable');
				$('#se-bom-informations').addClass('se-bom-informations-scrollable');
			}
			
			scope.arrive =  true;
						
			scope.initWidthWithCookie = false;
			
			// Create or replace existing cookie
			scope.createCookieForOrder = function() {
				var cookieOrder = [];
				
				angular.forEach(scope.headers, function(col) {
					this.push(col.key);
				}, cookieOrder);
				
				if (cookieOrder.toString() !== '') {
					$cookies['bomorder'] = cookieOrder.toString();
				}
			}
			
			// Sort headers according to preferences in cookie
			scope.sortHeadersWithCookie = function() {
				if ($cookies.bomorder && $cookies.bomorder.length > 0 ) {
					var cols = $cookies.bomorder.split(',');
					
					var currentColIndex = 0;
					
					while (currentColIndex < cols.length && scope.headers.length > 0 && currentColIndex < scope.headers.length) {
						if (cols.indexOf(scope.headers[currentColIndex].key) === -1) {
							scope.headers.splice(scope.headers.length-1, 0, scope.headers.splice(currentColIndex, 1)[0]);
						}
						else if (cols[currentColIndex] === scope.headers[currentColIndex].key) {
							currentColIndex++;
						}
						else {
							var indexOfCol = -1;
							// Is the cookie column in the json columns ?
							angular.forEach(scope.headers, function(header,index) {
								if (header.key === cols[currentColIndex]){
									indexOfCol = index;
								}
							});
							if (indexOfCol === -1) {
								currentColIndex++;
							}
							scope.headers.splice(currentColIndex, 0, scope.headers.splice(indexOfCol, 1)[0]);
						}
					}
				}
			};
			
			
			scope.checkCookieValidity = function() {
				if ($cookies.bomwidth && scope.headers.length) {
					var headers = $cookies.bomwidth.split(',');
					for (var i= 0; i<headers.length; i++) {
						var colProperties = headers[i].split(':');
						var colName = colProperties[0];
						var colwidth = parseInt(colProperties[1]);
						if (scope.headers[i]) {
							if (colName != scope.headers[i].key) {
								return false;
							}
						} else {
							return false;
						}
					}
					return true;
				}
				return false;
			}
			
			scope.saveColsWidth = function() {
				if (scope.headers.length > 0) {
					scope.widths = [];
					if (!scope.initWidthWithCookie && scope.checkCookieValidity()) {
						var headers = $cookies.bomwidth.split(',');
						for (var i= 0; i<headers.length; i++) {
							var colProperties = headers[i].split(':');
							var colwidth = parseInt(colProperties[1]);
							scope.widths.push(colwidth);
						}
						scope.initWidthWithCookie = true;
					} else {
						var bomwidth = [];
						
						var globalWidth = $('#se-bom-table').width();
						$('#se-bom-table thead tr th').each(function(i) {
							var headerWidth = $(this).outerWidth();
							var percentageWidthForCol = Math.round(parseInt((headerWidth * 100)/globalWidth));
							scope.widths.push(percentageWidthForCol); 
							bomwidth.push(scope.headers[i].key+':'+percentageWidthForCol);
						});
						
						$cookies.bomwidth = bomwidth.toString();
					}
				}
			}
			
			scope.saveColsWidthTag = function(source) {
				if (scope.headers.length > 0) {
					scope.widthsTag = [];
					var globalWidth = $('#se-bom-table').width();
					
					if (source) {
						$(source).find('thead tr th').each(function(i){
							var colWidthPercentage = $(this).outerWidth() * 100 / $(source).width();
							scope.widthsTag.push(colWidthPercentage);
						});
						var bomwidth = [];
						
						angular.forEach(scope.widthsTag, function(value, idx) {
							bomwidth.push(scope.headers[idx].key+':'+value);
						}, scope.widthsTag);
						
						$cookies.bomwidth = bomwidth.toString();
	
					} else {
						if(scope.widthsTagTmp) {
							var bomwidth = [];
							
							scope.widthsTag = scope.widthsTagTmp;
							
							angular.forEach(scope.widthsTag, function(value, idx) {
								bomwidth.push(scope.headers[idx].key+':'+value);
							}, scope.widthsTag);
							
							$cookies.bomwidth = bomwidth.toString();
						} else {
							if (!scope.initWidthWithCookie && scope.checkCookieValidity()) {
								var headers = $cookies.bomwidth.split(',');
								for (var i= 0; i<headers.length; i++) {
									var colProperties = headers[i].split(':');
									var colwidth = colProperties[1];
									scope.widthsTag.push(colwidth);
								}
								scope.initWidthWithCookie = true;
							} else {
								var bomwidth = [];
								
								var nbCols = scope.headers.length;
								var colWidthPercentage = 100/nbCols;
								
								angular.forEach(scope.headers, function(value, idx) {
									this.push(colWidthPercentage);
									bomwidth.push(scope.headers[idx].key+':'+colWidthPercentage);
								}, scope.widthsTag);
								
								$cookies.bomwidth = bomwidth.toString();
							}
						}
					}
				}
			}
			
			scope.setColsWidthTag = function(target) {
				scope.setBodyRowsTagCols(target);
				scope.setHeadersRowsTagCols(target);
			}
			
			scope.setHeadersRowsTagCols = function(target) {
				if (scope.widthsTag) {
					var selector;
					var productSelector;
					if (target) {
						selector = $(target.document).find('.sortable-tag');
						productSelector = $(target.document).find('.sortable-tag tbody tr td');
					} else {
						selector = $('.sortable-tag');
						productSelector = selector.find('tbody tr td');
					}
					selector.each(function() {
						$(this).find('colgroup col').each(function(i){
							$(this).css('width',scope.widthsTag[i]+'%');
						});
						$(this).find('thead tr th').each(function(i){
							$(this).css('width',scope.widthsTag[i]+'%');
							var percentInPixels = productSelector.eq(i).outerWidth();
							$(this).css('text-indent',0);
							$(this).css('max-width',percentInPixels+'px');
						});
					});
				}
			}
			
			scope.setBodyRowsTagCols = function(target) {
				if (scope.widthsTag) {
					var selector;
					if (target) {
						selector = $(target).find('.sortable-tag');
					} else {
						selector = $('.sortable-tag');
					}
					selector.each(function() {
						$(this).find('tbody tr td').each(function(i){
							$(this).css('width',scope.widthsTag[i]+'%');
						});
					});
				}
			}
			
			scope.setColsWidth = function() {
				if (scope.widths) {
					$('#se-bom-table colgroup col').each(function(i) {
						$(this).css('width',scope.widths[i]+'%');
					});
				}
			}
			
			scope.fixHeight = function() {
				if (scope.heightInPixels) {
					var currentSize = parseInt(angular.element('#se-bom-ui-scrollable-table-id').height());
					var scopeSize = parseInt(scope.heightInPixels);

					if (currentSize > scopeSize) {
						var tableSize = parseInt(angular.element('#se-bom-table-id').height());
						var diff = (tableSize-(currentSize-scopeSize))+'px';
						angular.element('#se-bom-table-id').css('height',diff);
					}
				}
			}
			
			scope.headers = [];
			
			// Fill in the headers array
			scope.initHeaders = function() {
				scope.headers = [];
				                 
				angular.forEach(scope.bom.header.columns, function(col) {
					this.push({headerName: col.label, key: col.id, type:col.type});
				}, scope.headers);
				
				if ($cookies.bomorder === undefined) {
					scope.createCookieForOrder();
				}
				scope.sortHeadersWithCookie();
				init();
			};
			
			var newbom = bomManagementService.getBom();
			
			scope.bom = newbom;
			scope.list = scope.bom.getSortedList();
			scope.initHeaders();
			
			
			// Manage clicks to sort rows
			scope.lastSortCell = undefined;
			scope.growingSens = true;
			
			scope.sort = function(key) {
				if (scope.lastSortCell && scope.lastSortCell == key) {
					scope.growingSens = !scope.growingSens;
				} else {
					scope.lastSortCell = key;
					scope.growingSens = true;
				}
				
				scope.bom.sortProducts(key,scope.growingSens);
			};
			
			
			
			var closest = undefined;
			var cellCollection = [];
			var headers;
			
			function init() {
				closest = undefined;
				cellCollection = [];
				headers = $("#se-bom-table>thead>tr>th");
				headers.each(function(index,element){
						var cell = $(this);
						var coord = {x:cell.offset().left,y:cell.offset().top,width:cell[0].offsetWidth};
						cellCollection.push(coord);
				});
			}
			
			function initTag() {
				closest = undefined;
				cellCollection = [];
				headers = $(".sortable-tag>thead>tr>th");
				headers.each(function(index,element){
						var cell = $(this);
						var coord = {x:cell.offset().left,y:cell.offset().top,width:cell[0].offsetWidth};
						cellCollection.push(coord);
				});
			}
			
			function unselectCol() {
				var rows = $("#se-bom-table").find("tr");
						
				$(rows).children().each(function(index,element){
					$(element).removeClass("positionable-left positionable-right")
				});
			}
			
			function unselectColTag() {
				var rows = $(".sortable-tag").find("tr");
				
				$(rows).children().each(function(index,element){
					$(element).removeClass("positionable-left positionable-right")
				});
			}
			
			scope.groupingByTag = scope.groupingByTag || false;
			
			scope.exportCSV = function() {
				scope.exportFile('text/csv','csv');
			}
			
			scope.exportXLS = function() {
				scope.exportFile('application/vnd.ms-excel','xls');
			}
			
			scope.reorderHeaderColumns = function() {
				var order = $cookies.bomorder;
				scope.bom.reorderColumns(order);
			}
			
			scope.exportFile = function(accept,extension) {
				scope.reorderHeaderColumns();
				var http = new XMLHttpRequest();
		        var params = JSON.stringify(scope.bom.jsonify());
		        var url = bomManagementService.getServerUrl()+'export';

		        http.open("POST", url, true);
		        http.setRequestHeader("Content-type", "application/json");
		        http.setRequestHeader("Accept", accept);
		        http.responseType = "blob";

		        http.onload = function () {
		            if (http.readyState == 4) {
		                if (http.status == 200) {
		                    //According to http://blog.eliacontini.info/post/79860720828/export-to-csv-using-javascript-the-download-attribute
		                    if (navigator.msSaveBlob) { // IE 10+
		                        navigator.msSaveBlob(http.response, 'bom.'+extension);
		                    } else {
		                        var a = document.createElement("a");
		                        document.body.appendChild(a);
		                        a.style = "display: none";
		                        a.href = window.URL.createObjectURL(http.response);
		                        a.download = 'bom.'+extension;
		                        a.target = '_blank';
		                        a.click();
		                    }
		                } else {
		                    var fr = new FileReader();
		                    fr.onload = function(evt) {
		                        var res = fr.result;
		                        $('#bomExportresult').val(res);
		                    };
		                    fr.readAsText(http.response);
		                }
		            }
		        };

		        http.onerror = function (e) {
		            $('#bomExportresult').val(e);
		        };

		        http.send(params);
				
			}
			
			scope.$watch(function () {
		       return bomManagementService.getBom();
		     },                       
		      function(newVal) {
		    	 $("#bom-spinner").show();
		    	 scope.bom = newVal;
		    	 scope.list = scope.bom.getSortedList();
		    	 scope.initHeaders();
		    	 scope.createTable();
		    }, true);
			
			scope.print = function() {
				bomManagementService.setPrinting(true);
				$timeout(function() {
					scope.groupingByTag ? scope.printTagBom() : scope.printFlatBom();
			    }, 50);
			}
			
			scope.printFlatBom = function() {
				var head = $('head').html();
				win = window.open();
				self.focus();
				win.document.open();
				win.document.write('<html class="bom-print-page"><head>');
				win.document.write(head);
				win.document.write('</head><body>');
				win.document.write('<table class="sortable se-bom-ui-table-prices" id="se-bom-table">');
				scope.createHeadersUI(win);
				scope.createProductRows(win);
				
			}
			
			scope.printTagBom = function() {
				var head = $('head').html();
				win = window.open();
				self.focus();
				win.document.open();
				win.document.write('<html class="bom-print-page"><head>');
				win.document.write(head);
				win.document.write('</head><body>');
				win.document.write('<div class="no-print" style="width:100%;text-align:center;color: #009530;cursor:pointer;"><i class="fa fa-print fa-2x" onclick="test()""></i></div><table class="sortable se-bom-ui-table-prices" id="se-bom-table">');
				scope.createTableUITag(win);
			}
			
			scope.closePrint = function(target) {
				var total = $('.se-bom-ui-essential').clone().wrap('<div>').parent();
				target.document.write('</table>');
				target.document.write(total.html());
				target.document.write('<script>function test() {document.getElementsByClassName("no-print")[0].style.visibility="hidden";window.print();window.close();}</script>');
				target.document.write('</body></html>');
				target.document.close();
				target.onbeforeunload = function(){
					bomManagementService.setPrinting(false);
					scope.$apply();
				}
				target.focus();
				
			}
			
			scope.createTable = function() {
				scope.emptyTable();
				if (scope.groupingByTag) {
					scope.createTableUITag();
				} else {
					scope.createHeadersUI();
					scope.createProductRows();
					init();
					scope.createInteractions();
				}
			}
			
			scope.emptyTable = function() {
				// Remove listeners for flatten bom
				/*$('#se-bom-table thead th i.click-sortable').off('click');
				$("table.sortable>thead>tr>th").draggable('destroy');
				$("#se-bom-table>thead>tr>th").resizable('destroy');
				
				// Remove listeners for multi-level bom
				$('table.sortable-tag thead tr th i.click-sortable').off('click');
				$('.accordion').off('click');
				$("table.sortable-tag>thead>tr>th").draggable('destroy');
				$(".sortable-tag>thead>tr>th").resizable('destroy');*/
				
				// Hide print section
				$('.print-section').hide();
				
				// Remove existing table content
				$('#se-bom-table').empty();
				$('#se-bom-table-header').empty();
			}
			
			scope.createHeadersUI = function(target) {
				// Create Headers tag
				var headerTag = '<colgroup>';
				
				angular.forEach(scope.headers, function(header, index) {
					var style = ''; 
					if (scope.widths) {
						style += 'style="width:'+scope.widths[index]+'%"';
					}
					headerTag += '<col '+style+'/>';
				});
				
				headerTag += '</colgroup><thead><tr>';
				
				angular.forEach(scope.headers, function(header, index) {
					var sortClass = '';
					if (scope.lastSortCell == header.key) {
						var selected = ' sort-selected';
						sortClass = scope.growingSens ? 'fa-sort-desc'+selected:'fa-sort-asc'+selected;
					} else {
						sortClass = 'fa-sort';
					}
					headerTag += '<th class="se-bom-ui-header text-center movable"><i class="fa '+sortClass+' click-sortable"></i> &nbsp;'+header.headerName+'</th>';
				});
				
				headerTag += '</tr></thead>';
				
				if (target) {
					target.document.write(headerTag);
				} else {
					$('#se-bom-table').append(headerTag);
				}
				
			}
			
			scope.createProductRows = function(target) {
				
				var displayed = 0;
				var limit = scope.bom.model.content.contents.length;
				
				function render() {
					for (var i=0; i<50 && displayed<limit; i++, displayed++) {
						var pack = scope.bom.model.content.contents[displayed];
						var classIndex = displayed%2 == 0 ? 'se-bom-ui-row-odd' : 'se-bom-ui-row-even';
						var bodyTag = '<tbody class="'+classIndex+'">';
						
						if (pack.bomProduct.products.length > 0) {
							
							angular.forEach(pack.bomProduct.products, function(product, indexProduct) {
								bodyTag += '<tr>';
								angular.forEach(scope.headers, function(header, indexHeader) {
									var cellTag = '<td class="';
									var cellClass= '';
									var cellContent = '';
									
									if (header.type && header.type === 'String') {
										if (cellClass.length == 0) {
											cellClass += 'text-left';
										} else {
											cellClass += ' text-left';
										}
									}
									if (header.type!== 'String') {
										if (cellClass.length == 0) {
											cellClass += 'text-right';
										} else {
											cellClass += ' text-right';
										}
									}
									
									// Reference cell
									if (header.key === 'reference') {
										if (cellClass.length == 0) {
											cellClass += 'se-bom-ui-part-cell';
										} else {
											cellClass += ' se-bom-ui-part-cell';
										}
										linkClassDisabled = product.dataSheetUrl && product.dataSheetUrl.length > 0 ? '' : 'se_bom_ui_link_disabled';
										if (target) {
											cellContent += product.reference;
										} else {
											cellContent += '<span><a href="'+product.dataSheetUrl+'" target="_blank" class="'+linkClassDisabled+'">'+product.reference+'</a></span>';
										}
									}
									
									// Quantity cell
									if (header.key === 'quantity') {
										var qty = product.quantity*pack.bomProduct.quantity;
										cellContent += '<span>'+(qty === 0 ? gettextCatalog.getString('Not Available') : qty)+'</span>';
									}
									
									// Discount cell
									if (header.key === 'discount') {
										cellContent += '<span>'+$filter('percentage')(product.discount)+'%</span>';
									}
									
									// unit price cell
									if (header.key === 'unitPrice') {
										var unitPrice = $filter('formatPrice')(product.unitPrice);
										var priceAvailable = product.unitPrice == 0;
										cellContent += '<span>'+(priceAvailable ? gettextCatalog.getString('Not Available') : (unitPrice+' '+scope.bom.getCurrency())) +'</span>';
									}
									
									// unit net price cell
									if (header.key === 'UNIT_NET_PRICE') {
										var unitPrice = $filter('formatPrice')(product.getUnitNetPrice());
										var priceAvailable = product.getUnitNetPrice() == 0;
										cellContent += '<span>'+(priceAvailable ? gettextCatalog.getString('Not Available') : (unitPrice+' '+scope.bom.getCurrency())) +'</span>';
									}
									
									// net price cell
									if (header.key === 'NET_PRICE') {
										var netPrice = $filter('formatPrice')(pack.bomProduct.quantity*product.getNetPrice());
										var priceAvailable = pack.bomProduct.quantity*product.getNetPrice() == 0;
										cellContent += '<span>'+(priceAvailable ? gettextCatalog.getString('Not Available') : (netPrice+' '+scope.bom.getCurrency())) +'</span>';
									}
									
									// other cell
									if (header.key!=='reference' && header.key!=='quantity' && header.key!=='discount' && header.key!=='unitPrice' && header.key!=='NET_PRICE' && header.key!=='UNIT_NET_PRICE') {
										cellContent += '<span>'+(header.key ? product[header.key] : '')+'</span>';
									}
									
									
									
									cellTag += cellClass+'">'+cellContent+'</td>';
									bodyTag += cellTag;
								});
								bodyTag += '</tr>';
							});
						} else {
							bodyTag += '<tr>';
							angular.forEach(scope.headers, function(header, indexHeader) {
								var cellTag = '<td class="';
								var cellClass= '';
								var cellContent = '';
								
								if (header.type && header.type === 'String') {
									if (cellClass.length == 0) {
										cellClass += 'text-left';
									} else {
										cellClass += ' text-left';
									}
								}
								if (header.type!== 'String') {
									if (cellClass.length == 0) {
										cellClass += 'text-right';
									} else {
										cellClass += ' text-right';
									}
								}
								
								// Reference cell
								if (header.key === 'reference') {
									if (cellClass.length == 0) {
										cellClass += 'se-bom-ui-part-cell';
									} else {
										cellClass += ' se-bom-ui-part-cell';
									}
									linkClassDisabled = pack.bomProduct.dataSheetUrl && pack.bomProduct.dataSheetUrl.length > 0 ? '' : 'se_bom_ui_link_disabled';
									if (target) {
										cellContent += pack.bomProduct.reference;
									} else {
										cellContent += '<span><a href="'+pack.bomProduct.dataSheetUrl+'" target="_blank" class="'+linkClassDisabled+'">'+pack.bomProduct.reference+'</a></span>';
									}
								}
								
								// Quantity cell
								if (header.key === 'quantity') {
									var qty = pack.bomProduct.quantity;
									cellContent += '<span>'+(qty === 0 ? gettextCatalog.getString('Not Available') : qty)+'</span>';
								}
								
								// Discount cell
								if (header.key === 'discount') {
									cellContent += '<span>'+$filter('percentage')(pack.bomProduct.discount)+'%</span>';
								}
								
								// unit price cell
								if (header.key === 'unitPrice') {
									var unitPrice = $filter('formatPrice')(pack.bomProduct.unitPrice);
									var priceAvailable = pack.bomProduct.unitPrice == 0;
									cellContent += '<span>'+(priceAvailable ? gettextCatalog.getString('Not Available') : (unitPrice+' '+scope.bom.getCurrency())) +'</span>';
								}
								
								// unit net price cell
								if (header.key === 'UNIT_NET_PRICE') {
									var unitPrice = $filter('formatPrice')(pack.bomProduct.getUnitNetPrice());
									var priceAvailable = pack.bomProduct.getUnitNetPrice() == 0;
									cellContent += '<span>'+(priceAvailable ? gettextCatalog.getString('Not Available') : (unitPrice+' '+scope.bom.getCurrency())) +'</span>';
								}
								
								// net price cell
								if (header.key === 'NET_PRICE') {
									var netPrice = $filter('formatPrice')(pack.bomProduct.getNetPrice());
									var priceAvailable = pack.bomProduct.getNetPrice() == 0;
									cellContent += '<span>'+(priceAvailable ? gettextCatalog.getString('Not Available') : (netPrice+' '+scope.bom.getCurrency())) +'</span>';
								}
								
								// other cell
								if (header.key!=='reference' && header.key!=='quantity' && header.key!=='discount' && header.key!=='unitPrice' && header.key!=='NET_PRICE' && header.key!=='UNIT_NET_PRICE') {
									cellContent += '<span>'+(header.key ? pack.bomProduct[header.key] : '')+'</span>';
								}
								
								
								
								cellTag += cellClass+'">'+cellContent+'</td>';
								bodyTag += cellTag;
							});
							bodyTag += '</tr>';
						}
						
						bodyTag += '</tbody>';
						
						if (target) {
							target.document.write(bodyTag);
						} else {
							$('#se-bom-table').append(bodyTag);
						}
					  }
					if (displayed < scope.bom.model.content.contents.length) {
						window.setTimeout(render, 0);
					} else {
						$("#bom-spinner").hide();
						if (scope.bom.model.content.contents.length > 0) {
							$('.print-section').show();
						}
						if (target) {
							scope.closePrint(target);
						}
						
						scope.fixHeight(); 
					}
					
					scope.saveColsWidth();
					scope.setColsWidth();
				}
				
				render();
			}
			
			scope.createInteractions = function() {
				$('#se-bom-table thead th i.click-sortable').on('click',function(event){
					// Get the th cell
					$("#bom-spinner").show();
					var headerCell = $(event.target).closest('th');
					
					// Get the index of the cell
					var indexHeaderCell = $('#se-bom-table thead th').index(headerCell);
					
					var key = scope.headers[indexHeaderCell].key;
					
					if (scope.lastSortCell && scope.lastSortCell == key) {
						scope.growingSens = !scope.growingSens;
					} else {
						scope.lastSortCell = key;
						scope.growingSens = true;
					}
					scope.$apply();
					
					scope.bom.sortProducts(key,scope.growingSens);
					scope.$apply();
					scope.createTable();
				});
				
				// Instantiate drag and drop for columns
				$("table.sortable>thead>tr>th").draggable({
					helper: "clone",
					drag: function(event, ui) {
						var index = $("#se-bom-table>thead>tr>th").index($(event.target));
						var rows = $("#se-bom-table").find("tr");
						
						if (ui.offset.left < cellCollection[index].x-20) {
							for (var i=0; i<index; i++) {
								if (closest===undefined || (cellCollection[i].x<ui.offset.left)){
									closest = i;
								}
							}
							
							unselectCol();
							$(rows).each(function(index,element){
								$(element).children().eq(closest).addClass("positionable-left");
							});
							
						} else if (ui.offset.left > cellCollection[index].x+20){
							for (var i=cellCollection.length-1; i>index; i--) {
								if (closest===undefined || (cellCollection[i].x>ui.offset.left)){
									closest = i;
								}
							}
							
							unselectCol();
							$(rows).each(function(index,element){
								$(element).children().eq(closest).addClass("positionable-right");
							});
							
						} else {
							closest = undefined;
							
							unselectCol();
						}
						
						$(rows).each(function(i,e){
							$(e).children().eq(index).addClass("col-disabled");
						});
						
					},
					stop: function(event, ui) {
						var index = $("#se-bom-table>thead>tr>th").index($(event.target));
						
						var rows = $(event.target).closest('table').find('tr');
						$(rows).each(function(i,e){
							$(e).children().eq(index).removeClass("col-disabled");
						});
						
						if (closest !== undefined) {
							if (closest >= scope.headers.length) {
						        var k = closest - scope.headers.length;
						        while ((k--) + 1) {
						        	scope.headers.push(undefined);
						        }
						    }
							//scope.headers.splice(closest, 0, scope.headers.splice(index, 1)[0]);
							
							scope.headers.splice(closest, 0, scope.headers.splice(index, 1)[0]);
							scope.widths.splice(closest, 0, scope.widths.splice(index, 1)[0]);
							scope.$apply();
							scope.createCookieForOrder();
							scope.$apply();
							scope.createTable();
						}
						unselectCol();
					}
				});
				
				// Instantiate resize
				$("#se-bom-table>thead>tr>th").resizable({
					handles: "e",
					resize: function(event, ui) {
						var table = ui.element.closest("table"),
							cols = table.find(">colgroup>col"),
							col = cols.filter(":eq(" + ui.element.index() + ")"),
							colWidth = Math.floor(ui.size.width * 100 / table.width()),
							oriColWidth = parseInt(col.css("width"), 10),
							diff = colWidth - oriColWidth;
						// Set the width (%) in all the columns.
						
						cols.each(function(index) {
							if (index == ui.element.index()) {
								$(this).css("width", colWidth + "%");
							}else if (index == ui.element.index()+1){
								var width = Math.floor(parseInt($(this).css("width"), 10) - diff );
								$(this).css("width", width + "%");
							}
						});
						// Remove any inline style created by the resizable feature.
						ui.element.removeAttr("style");
				
					},
					stop: function (event, ui) {
						var table = ui.element.closest("table"),
							cols = table.find(">colgroup>col"),
							col = cols.filter(":eq(" + ui.element.index() + ")"),
							colWidth = Math.floor(ui.size.width * 100 / table.width()),
							oriColWidth = parseInt(col.css("width"), 10),
							diff = colWidth - oriColWidth;
						// Set the width (%) in all the columns.
						
						cols.each(function(index) {
							if (index == ui.element.index()) {
								$(this).css("width", colWidth + "%");
							}else if (index == ui.element.index()+1){
								var width = Math.floor(parseInt($(this).css("width"), 10) - diff );
								$(this).css("width", width + "%");
							}
						});
						
						// Remove any inline style created by the resizable feature.
						ui.element.removeAttr("style");
						// Callback action:: Save colWidth in database using id => col.attr("id")
						scope.$apply();
						scope.saveColsWidth();
						scope.$apply();
						init();
					}
				});
			}
			
			scope.createTableUITag = function(target) {
				if (scope.bom.header.displayColumnHeaders) {
					var paddingScrollbar = 0;
					if (scope.scrollable && angular.isUndefined(target)) {
						paddingScrollbar = getScrollbarWidth();
					}
					var trTag = '<tr><td class="se-bom-ui-basket-title se-bom-ui-table-tag-title" ></td><td style="padding-right:'+paddingScrollbar+'px;"><table class="sortable-tag se-bom-ui-table-prices"><colgroup>';
				
					angular.forEach(scope.headers, function(header, index) {
						trTag += '<col ';
						if (target && scope.widthsTag && scope.widthsTag.length > 0) {
							trTag += 'style="width:'+scope.widthsTag[index]+'%"';
						}
						trTag += '/>';
					});
					
					trTag += '</colgroup><thead><tr>';
					
					angular.forEach(scope.headers, function(header, index) {
						var sortClass = '';
						if (scope.lastSortCell == header.key) {
							var selected = ' sort-selected';
							sortClass = scope.growingSens ? 'fa-sort-asc'+selected:'fa-sort-desc'+selected;
						} else {
							sortClass = 'fa-sort';
						}
						trTag += '<th class="text-center movable se-bom-ui-header" ';
						if (target && scope.widthsTag && scope.widthsTag.length > 0) {
							trTag += 'style="width:'+scope.widthsTag[index]+'%"';
						}
						if (scope.bom.header.enableSorting) {
							trTag += '><i class="fa '+sortClass+' click-sortable"></i> &nbsp;'+header.headerName +'</th>';
						} else {
							trTag += '>'+header.headerName +'</th>';
						}
						
					});
					
					trTag += '</tr></thead></table></td></tr>';
					
					if (target) {
						target.document.write(trTag);
					} else {
						if (scope.scrollable) {
							$('#se-bom-table-header').append(trTag);
						} else {
							$('#se-bom-table').append(trTag);
						}
					}
					
				}
				
				var displayed = 0;
				var limit = scope.list.length;
				
				function render() {
					for (var i=0; i<50 && displayed<limit; i++, displayed++) {
						var row = scope.list[displayed];
						var classIndex = displayed%2 == 0 ? 'se-bom-ui-row-odd' : 'se-bom-ui-row-even';
						trClass = 'se-bom-ui-basket-title se-bom-ui-table-tag-title chevron-opened';
						if (row.level === 0) {
							trClass += ' root-title';
						}
						
						if (row.accordion) {
							trClass += ' accordion';
						}
						
						var content = '';
						if (row.accordion && angular.isUndefined(target)) {
							content += '<span class="glyphicon glyphicon-chevron-up"></span>&nbsp;';
						}
						
						if (row.title==='Others' && row.level > 0) {
						} else {
							content += gettextCatalog.getString(row.title);
						}
						
						var trTag = '<tr class="'+row.customClass+'"><td class="'+trClass+'" style="padding-left:'+(((row.level-1)*35) >=0 ? ((row.level-1)*35) : 0)+'px">';
						trTag += content+'</td>';
						
						if (row.title !== '' && row.displayTitle) {
							trTag += '<td class="header-cell"><table class="sortable-tag se-bom-ui-table-prices"><colgroup>';
							angular.forEach(scope.headers, function(header, index) {
								trTag += '<col ';
								if (target && scope.widthsTag && scope.widthsTag.length > 0) {
									trTag += 'style="width:'+scope.widthsTag[index]+'%"';
								}
								trTag += '/>';
							});
							trTag += '</colgroup><thead><tr>';
							angular.forEach(scope.headers, function(header, index) {
								var sortClass = '';
								if (scope.lastSortCell == header.key) {
									var selected = ' sort-selected';
									sortClass = scope.growingSens ? 'fa-sort-asc'+selected:'fa-sort-desc'+selected;
								} else {
									sortClass = 'fa-sort';
								}
								trTag += '<th class="text-center movable se-bom-ui-header" ';
								if (target && scope.widthsTag && scope.widthsTag.length > 0) {
									trTag += 'style="width:'+scope.widthsTag[index]+'%"';
								}
								
								if (scope.bom.header.enableSorting) {
									trTag += '><i class="fa '+sortClass+' click-sortable"></i>&nbsp;'+header.headerName +'</th>';
								} else {
									trTag += '>'+header.headerName +'</th>';
								}
							});
							
							
							trTag += '</tr></thead></table></td>';
						}
						
						
						trTag += '<td class="subtotal-in-group subtotal-row se-bom-ui-table-prices"><span>';
						if (scope.bom.header.messages['Subtotal']) {
							trTag += scope.bom.header.messages['Subtotal'];
						} else {
							trTag += gettextCatalog.getString('bom-subtotal-label');
						}
						trTag += '</span><span class="total-value">'+$filter('formatPrice')(row.amount)+'</span> '+scope.bom.getCurrency()+'</td>';
						
						if (row.subtotal) {
							trTag += '<td class="subtotal-row"><span>';
							if (scope.bom.header.messages['Subtotal']) {
								trTag += scope.bom.header.messages['Subtotal'];
							} else {
								trTag += gettextCatalog.getString('bom-subtotal-label');
							}
							
							trTag += '</span><span class="total-value">';
							
							trTag += $filter('formatPrice')(row.amount);
							
							trTag += '</span> '+scope.bom.getCurrency();
							
							trTag += '</td>';
						}
						
						else if (row.title === '') {
							trTag += '<td><table class="sortable-tag se-bom-ui-table-prices">';
							
							if (row.products && row.products.bomProduct.products.length > 0) {
								
								angular.forEach(row.products.bomProduct.products, function(product, indexProduct) {
									trTag += '<tr class="'+classIndex+'">';
									angular.forEach(scope.headers, function(header, indexHeader) {
										var cellTag = '<td class="';
										var cellClass= '';
										var cellContent = '';
										
										if (header.type && header.type === 'String') {
											if (cellClass.length == 0) {
												cellClass += 'text-left';
											} else {
												cellClass += ' text-left';
											}
										}
										if (header.type!== 'String') {
											if (cellClass.length == 0) {
												cellClass += 'text-right';
											} else {
												cellClass += ' text-right';
											}
										}
										
										// Reference cell
										if (header.key === 'reference') {
											if (cellClass.length == 0) {
												cellClass += 'se-bom-ui-part-cell';
											} else {
												cellClass += ' se-bom-ui-part-cell';
											}
											linkClassDisabled = product.dataSheetUrl && product.dataSheetUrl.length > 0 ? '' : 'se_bom_ui_link_disabled';
											
											if (target) {
												cellContent += '<span>'+product.reference+'</span>';
											} else {
												cellContent += '<span><a href="'+product.dataSheetUrl+'" target="_blank" class="'+linkClassDisabled+'">'+product.reference+'</a></span>';
											}
											
										}
										
										// Quantity cell
										if (header.key === 'quantity') {
											var qty = product.quantity*row.products.bomProduct.quantity;
											cellContent += '<span>'+(qty === 0 ? gettextCatalog.getString('Not Available') : qty)+'</span>';
										}
										
										// Discount cell
										if (header.key === 'discount') {
											cellContent += '<span>'+$filter('percentage')(product.discount)+'%</span>';
										}
										
										// unit price cell
										if (header.key === 'unitPrice') {
											var unitPrice = $filter('formatPrice')(product.unitPrice);
											var priceAvailable = product.unitPrice == 0;
											cellContent += '<span>'+(priceAvailable ? gettextCatalog.getString('Not Available') : (unitPrice+' '+scope.bom.getCurrency())) +'</span>';
										}
										
										// unit net price cell
										if (header.key === 'UNIT_NET_PRICE') {
											var unitPrice = $filter('formatPrice')(product.getUnitNetPrice());
											var priceAvailable = product.getUnitNetPrice() == 0;
											cellContent += '<span>'+(priceAvailable ? gettextCatalog.getString('Not Available') : (unitPrice+' '+scope.bom.getCurrency())) +'</span>';
										}
										
										// net price cell
										if (header.key === 'NET_PRICE') {
											var netPrice = $filter('formatPrice')(row.products.bomProduct.quantity*product.getNetPrice());
											var priceAvailable = row.products.bomProduct.quantity*product.getNetPrice() == 0;
											cellContent += '<span>'+(priceAvailable ? gettextCatalog.getString('Not Available') : (netPrice+' '+scope.bom.getCurrency())) +'</span>';
										}
										
										// other cell
										if (header.key!=='reference' && header.key!=='quantity' && header.key!=='discount' && header.key!=='unitPrice' && header.key!=='NET_PRICE' && header.key!=='UNIT_NET_PRICE') {
											cellContent += '<span>'+(header.key ? product[header.key] : '')+'</span>';
										}
										
										
										
										cellTag += cellClass+'" ';
										if (target && scope.widthsTag && scope.widthsTag.length > 0) {
											cellTag += ' style="width:'+scope.widthsTag[indexHeader]+'%"';
										}
										cellTag += '>'+cellContent+'</td>';
										trTag += cellTag;
									});
									trTag += '</tr>';
								});
							} else {
								trTag += '<tr class="'+classIndex+'">';
								angular.forEach(scope.headers, function(header, indexHeader) {
									var cellTag = '<td class="';
									var cellClass= '';
									var cellContent = '';
									
									if (header.type && header.type === 'String') {
										if (cellClass.length == 0) {
											cellClass += 'text-left';
										} else {
											cellClass += ' text-left';
										}
									}
									if (header.type!== 'String') {
										if (cellClass.length == 0) {
											cellClass += 'text-right';
										} else {
											cellClass += ' text-right';
										}
									}
									
									// Reference cell
									if (header.key === 'reference') {
										if (cellClass.length == 0) {
											cellClass += 'se-bom-ui-part-cell';
										} else {
											cellClass += ' se-bom-ui-part-cell';
										}
										linkClassDisabled = row.products.bomProduct.dataSheetUrl && row.products.bomProduct.dataSheetUrl.length > 0 ? '' : 'se_bom_ui_link_disabled';
										
										if (target) {
											cellContent += '<span>'+row.products.bomProduct.reference+'</span>';
										} else {
											cellContent += '<span><a href="'+row.products.bomProduct.dataSheetUrl+'" target="_blank" class="'+linkClassDisabled+'">'+row.products.bomProduct.reference+'</a></span>';
										}
									}
									
									// Quantity cell
									if (header.key === 'quantity') {
										var qty = row.products.bomProduct.quantity;
										cellContent += '<span>'+(qty === 0 ? gettextCatalog.getString('Not Available') : qty)+'</span>';
									}
									
									// Discount cell
									if (header.key === 'discount') {
										cellContent += '<span>'+$filter('percentage')(row.products.bomProduct.discount)+'%</span>';
									}
									
									// unit price cell
									if (header.key === 'unitPrice') {
										var unitPrice = $filter('formatPrice')(row.products.bomProduct.unitPrice);
										var priceAvailable = row.products.bomProduct.unitPrice == 0;
										cellContent += '<span>'+(priceAvailable ? gettextCatalog.getString('Not Available') : (unitPrice+' '+scope.bom.getCurrency())) +'</span>';
									}
									
									// unit net price cell
									if (header.key === 'UNIT_NET_PRICE') {
										var unitPrice = $filter('formatPrice')(row.products.bomProduct.getUnitNetPrice());
										var priceAvailable = row.products.bomProduct.getUnitNetPrice() == 0;
										cellContent += '<span>'+(priceAvailable ? gettextCatalog.getString('Not Available') : (unitPrice+' '+scope.bom.getCurrency())) +'</span>';
									}
									
									// net price cell
									if (header.key === 'NET_PRICE') {
										var netPrice = $filter('formatPrice')(row.products.bomProduct.getNetPrice());
										var priceAvailable = row.products.bomProduct.getNetPrice() == 0;
										cellContent += '<span>'+(priceAvailable ? gettextCatalog.getString('Not Available') : (netPrice+' '+scope.bom.getCurrency())) +'</span>';
									}
									
									// other cell
									if (header.key!=='reference' && header.key!=='quantity' && header.key!=='discount' && header.key!=='unitPrice' && header.key!=='NET_PRICE' && header.key!=='UNIT_NET_PRICE') {
										cellContent += '<span>'+(header.key ? row.products.bomProduct[header.key] : '')+'</span>';
									}
									
									
									
									cellTag += cellClass+'" ';
									if (target && scope.widthsTag && scope.widthsTag.length > 0) {
										cellTag += ' style="width:'+scope.widthsTag[indexHeader]+'%"';
									}
									cellTag += '>'+cellContent+'</td>';
									trTag += cellTag;
								});
								trTag += '</tr>';
							}
							
							trTag += '</table></td>';
							
						}
						trTag += '</tr>';
						if (target) {
							target.document.write(trTag);
						} else {
							$('#se-bom-table').append(trTag);
						}
						
					}
					if (displayed < scope.list.length) {
						window.setTimeout(render, 0);
					} else {
						$("#bom-spinner").hide();
						if (scope.bom.model.content.contents.length > 0) {
							$('.print-section').show();
						}
						if (target) {
							scope.closePrint(target);
						}else {
							initTag();
							scope.createInteractionsTag();
						}
						scope.fixHeight();
						scope.arrive =  false;
					}
					if (angular.isUndefined(target)) {
						scope.saveColsWidthTag();
						scope.setColsWidthTag();
					} else {
						scope.setColsWidthTag(target);
					}
				}
				render();
			}
			
			scope.createInteractionsTag = function() {
				// Configure accordion
				if (scope.bom.header.enableSorting) {
					$('table.sortable-tag thead tr th i.click-sortable').on('click',function(event){
						$("#bom-spinner").show();
						// Get the th cell
						var headerCell = $(event.target).closest('th');
						
						var headerRow = $(headerCell).closest('thead');
						
						// Get the index of the cell
						var indexHeaderCell = $(headerRow).find('th').index(headerCell);
						
						var key = scope.headers[indexHeaderCell].key;
						
						if (scope.lastSortCell && scope.lastSortCell == key) {
							scope.growingSens = !scope.growingSens;
						} else {
							scope.lastSortCell = key;
							scope.growingSens = true;
						}
						scope.$apply();

						scope.list = scope.bom.getSortedList(key,scope.growingSens);
						scope.widthsTagTmp = scope.widthsTag;
						scope.$apply();
						scope.createTable();
					});
				}
				
				$('.accordion').on('click',function(event) {
					var selfClasses = this.classList;
					var bodyRow = $(this).parent('tr')[0];
					var spanChevron = $(this).find('span')[0];
					if ($(this).hasClass('chevron-opened')) {
						$(this).removeClass('chevron-opened');
						$(this).addClass('chevron-closed');
						$(spanChevron).removeClass('glyphicon-chevron-up');
						$(spanChevron).addClass('glyphicon-chevron-down');
						$(bodyRow).find('td.header-cell').hide();
						$(bodyRow).find('td.subtotal-in-group').show();
					} else if ($(this).hasClass('chevron-closed')) {
						$(this).removeClass('chevron-closed');
						$(this).addClass('chevron-opened');
						$(spanChevron).removeClass('glyphicon-chevron-down');
						$(spanChevron).addClass('glyphicon-chevron-up');
						$(bodyRow).find('td.subtotal-in-group').hide();
						$(bodyRow).find('td.header-cell').show();
					}
				
					var classes = bodyRow.classList;
					var prefix = 'bom-custom-attribute-level-';
					var level = undefined;
					
					// Get the level of the clicked row
					angular.forEach(classes, function(classToInvestigate) {
						if (classToInvestigate.indexOf(prefix) === 0) {
							level = parseInt(classToInvestigate.substring(prefix.length,classToInvestigate.length));
						}
					});
					
					var neddsHiding = !$(this).parent('tr').next('tr').is(":hidden");

					// browse all following elements to toggle the matching rows
					var nexts = $(this).parent('tr').nextAll('tr');
					nexts.each(function(i,e){
						var nextSpanChevron = $(this).find('td.accordion span')[0];
						var nextClasses = this.classList;
						var nextLevel = undefined;
						
						// Get the level of the clicked row
						angular.forEach(nextClasses, function(classToInvestigate) {
							if (classToInvestigate.indexOf(prefix) === 0) {
								nextLevel = parseInt(classToInvestigate.substring(prefix.length,classToInvestigate.length));
							}
						});

						if (nextLevel > level || angular.isUndefined(nextLevel)) {
							if (neddsHiding) {
								$(this).hide();
								$(this).removeClass('chevron-opened');
								$(this).addClass('chevron-closed');
								$(this).find('td').eq(0).removeClass('chevron-opened');
								$(this).find('td').eq(0).addClass('chevron-closed');
								$(nextSpanChevron).removeClass('glyphicon-chevron-up');
								$(nextSpanChevron).addClass('glyphicon-chevron-down');
								$(this).find('td.header-cell').hide();
								$(this).find('td.subtotal-in-group').show();
							} else {
								$(this).show();
								$(this).removeClass('chevron-closed');
								$(this).addClass('chevron-opened');
								$(this).find('td').eq(0).removeClass('chevron-closed');
								$(this).find('td').eq(0).addClass('chevron-opened');
								$(nextSpanChevron).removeClass('glyphicon-chevron-down');
								$(nextSpanChevron).addClass('glyphicon-chevron-up');
								$(this).find('td.subtotal-in-group').hide();
								$(this).find('td.header-cell').show();
							}
						} else {
							return false
						}
					});
					
				  });
				
				// Instantiate drag and drop
				$("table.sortable-tag>thead>tr>th").draggable({
					helper: "clone",
					drag: function(event, ui) {
						//var index = $(".sortable-tag>thead>tr>th").index($(event.target));
						var index = $(event.target).closest('tr').find('th').index($(event.target));
						var rows = $(".sortable-tag").find("tr");
				
						if (ui.offset.left < cellCollection[index].x-20) {
							for (var i=0; i<index; i++) {
								if (closest===undefined || (cellCollection[i].x<ui.offset.left)){
									closest = i;
								}
							}
							
							unselectCol();
							$(rows).each(function(index,element){
								$(element).children().eq(closest).addClass("positionable-left");
							});
							
						} else if (ui.offset.left > cellCollection[index].x+20){
							for (var i=cellCollection.length-1; i>index; i--) {
								if (closest===undefined || (cellCollection[i].x>ui.offset.left)){
									closest = i;
								}
							}
							
							unselectColTag();
							$(rows).each(function(index,element){
								$(element).children().eq(closest).addClass("positionable-right");
							});
							
						} else {
							closest = undefined;
							
							unselectColTag();
						}
						
						$(rows).each(function(i,e){
							$(e).children().eq(index).addClass("col-disabled");
						});
					},
					stop: function(event, ui) {
						//var index = $(".sortable-tag>thead>tr>th").index($(event.target));
						var index = $(event.target).closest('tr').find('th').index($(event.target));
						
						$('table.sortable-tag').each(function(){
							$(this).find('tr').each(function(){
								$(this).children().eq(index).removeClass("col-disabled");
							});
						});
						
						if (closest !== undefined && closest < scope.headers.length) {
							if (closest >= scope.headers.length) {
						        var k = closest - scope.headers.length;
						        while ((k--) + 1) {
						        	scope.headers.push(undefined);
						        }
						    }
							scope.headers.splice(closest, 0, scope.headers.splice(index, 1)[0]);
							scope.widthsTag.splice(closest, 0, scope.widthsTag.splice(index, 1)[0]);
							scope.widthsTagTmp = scope.widthsTag;
							scope.$apply();
							scope.createCookieForOrder();
							
							scope.$apply();
							scope.createTable();
						}
							
						unselectCol();
					}
				});
				
				// Instantiate resize
				$(".sortable-tag>thead>tr>th").resizable({
					handles: "e",
					resize: function(event, ui) {
						var table = ui.element.closest("table"),
							cols = table.find(">colgroup>col"),
							col = cols.filter(":eq(" + ui.element.index() + ")"),
							colWidth = Math.floor(ui.size.width * 100 / table.width()),
							
							oriColWidth = parseInt(col.css("width"), 10),
							diff = colWidth - oriColWidth;
						// Set the width (%) in all the columns.
						cells = table.find('thead tr th');
						
						cols.each(function(index) {
							if (index == ui.element.index()) {
								$(this).css("width", colWidth + "%");
							}else if (index == ui.element.index()+1){
								var width = Math.floor(parseInt($(this).css("width"), 10) - diff );
								$(this).css("width", width + "%");
							}
						});
						
						cells.each(function(index) {
							if (index == ui.element.index()) {
								$(this).css("max-width", (colWidth * table.width() / 100) + "px");
								$(this).css("min-width", (colWidth * table.width() / 100) + "px");
							}else if (index == ui.element.index()+1){
								var width = Math.floor(parseInt($(this).css("width"), 10) - diff );
								$(this).css("max-width", width + "px");
								$(this).css("min-width", "0");
								$(this).addClass("resizing");
							}
						});
						// Remove any inline style created by the resizable feature.
						//ui.element.removeAttr("style");
				
					},
					stop: function (event, ui) {
						var table = ui.element.closest("table");
						var cols = table.find(">colgroup>col");
						var cells = ui.element.closest("tr").find(">th");
						cells.each(function(index) {
							var colWidth = $(this).outerWidth() * 100 / table.width();
							$(cols.index(index)).css("width", colWidth + "%");
							$(this).removeClass("resizing");
						});
						
						scope.saveColsWidthTag(table);
						scope.setColsWidthTag();
						
						// Remove any inline style created by the resizable feature.
						//ui.element.removeAttr("style");
						scope.$apply();
						initTag();
					}
				});
				
				if (!scope.bom.header.isExpanded) {
					if (scope.arrive) {
						$('.bom-custom-attribute-level-0').each(function(){
							$(this).find('td').eq(0).find('span').eq(0).trigger('click');
						});
					}
				}
			}
			
			function getScrollbarWidth() {
			    var outer = document.createElement("div");
			    outer.style.visibility = "hidden";
			    outer.style.width = "100px";
			    outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

			    document.body.appendChild(outer);

			    var widthNoScroll = outer.offsetWidth;
			    // force scrollbars
			    outer.style.overflow = "scroll";

			    // add innerdiv
			    var inner = document.createElement("div");
			    inner.style.width = "100%";
			    outer.appendChild(inner);        

			    var widthWithScroll = inner.offsetWidth;

			    // remove divs
			    outer.parentNode.removeChild(outer);

			    return widthNoScroll - widthWithScroll;
			}
		}
	};
}]);
