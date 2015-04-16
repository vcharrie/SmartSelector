'use strict';

/**
 * bom controller
 */
angular.module('bom', ['ngRoute', 'business', 'rest', 'tracking', 'LocalStorageModule', 'shared', 'smartPanelWizzard', 'priceListManager', 'familyDiscountEditorDirective'])
    .config(function ($routeProvider) {
        $routeProvider.when('/bom',
            {
                controller: 'bom',
                templateUrl: 'modules/bom/bom.view.html',
                resolve: {
                    fullBom: function () {
                        return false;
                    },

                    factory: ['projectService', '$location', function (projectService, $location) {
                        return projectService.checkProjectExists(function () {
                            $location.path('/');
                        });
                    }]
                }
            }).when('/full-bom',
            {
                controller: 'bom',
                templateUrl: 'modules/bom/bom.full.view.html',
                resolve: {
                    fullBom: function () {
                        return true;
                    },
                    factory: ['projectService', '$location', function (projectService, $location) {
                        return projectService.checkProjectExists(function () {
                            $location.path('/');
                        });
                    }]
                }
            });
    })
    .controller('bom', function ($rootScope, $scope, $injector, projectService, logger, gettextCatalog, $location, _, ProductPack, productPriceService, bomTrackingService, auxiliariesService, adminService, loginService, appConstants, smartPanelService, modifyProductService, translationService, discountEditorService, smartPanelWizzardService, networkService, partInfoService, BomProduct, bomManagementService, fullBom, smartPanelTrackingService, addItemService, Project, Product, PartPack, Part, bomDialogService) {


        var electricProductsList = [];
        var mechanicProductsList = [];
        var distributionProductsList = [];
        var functionalUnitsProductsList = [];
        var additionalProductsList = [];
        var additionalItemList = [];

        $scope.fullBom = fullBom;

        $scope.currency = appConstants.currency;

        $scope.disabledSmartPanelHint = gettextCatalog.getString('bom-smart-panel-disabled-hint');

        /**
         * Change an EQQ products list and pre-format a lost to integrate in the request to PACE's BOM
         * @param eqqProducts products from EQQ to export
         * @param {String} switchboardPart identify / group products by type in the BOM
         * @returns {Array} of products pre-formated for requesting PACE's BOM webservice
         */
        var eqqProductsList2pace = function (eqqProducts, switchboardPart) {
            var bomProducts = [];

            if (!eqqProducts) {
                return bomProducts;
            }

            for (var i = 0; i < eqqProducts.length; i++) {
                var parts = eqqProducts[i].product.parts;
                var productToPush = {
                    'product': {
                        'reference': parts[0].part.partCode,
                        'quantity': eqqProducts[i].quantity,
                        'products': []
                    },
                    'tags': {
                        'type': switchboardPart,
                        'switchboard': eqqProducts[i].switchboardName
                    }
                };

                for (var j = 0; j < parts.length; j++) {
                    var part = parts[j];
                    var unitPrice = (isNaN(part.part.price) ? 0 : part.part.price);

                    productToPush.product.products.push(
                        {
                            'reference': part._part.partCode,
                            'quantity': part.quantity,
                            'unitPrice': unitPrice,
                            'discount': (part.part.discount / 100),
                            'description': part.part.longName,
                            'dataSheetUrl': part.part.dataSheetUrl,
                            'pictureUrl': part.part.image
                        }
                    );
                }
                bomProducts.push(productToPush);
            }
            return bomProducts;
        };

        var genrateBomAsJson = function (columns, products, currency, culture) {

            //region BUILD PACE REQUEST HEADER
            var requestDataHeader = {
                'columns': columns,
                'groups': [{
                    'tag': 'type',
                    'displayTotal': false
                }
                ],
                'currency': currency,
                'displayTotal': true,
                'language': culture,
                'messages': {
                    'All prices and discounts are only indicative information': gettextCatalog.getString('bom-bottom-information-label1'),
                    'Free information': gettextCatalog.getString('bom-bottom-information-label2')
                },
                'enableSorting': false
            };
            //in case of full bom add swb tag
            if ($scope.fullBom) {
                requestDataHeader.groups = [
                    {
                        'tag': 'switchboard',
                        'displayColumnHeaders': false,
                        'accordion': true

                    },
                    {
                        'tag': 'type',
                        'displayTotal': false
                    }
                ];

                // Collapse the bom in full bom
                requestDataHeader.isExpanded=false;
            }


            //endregion

            //region BUILD PACE REQUEST DATA
            var electricals = eqqProductsList2pace(products.electricProducts.products, products.electricProducts.label);
            var mechanicals = eqqProductsList2pace(products.mechanicProducts.products, products.mechanicProducts.label);
            var distributions = eqqProductsList2pace(products.distributionProducts.products, products.distributionProducts.label);
            var functionalUnits = eqqProductsList2pace(products.functionalUnitsProducts.products, products.functionalUnitsProducts.label);
            var additional = eqqProductsList2pace(products.additionalProducts.products, products.additionalProducts.label);
            var additionalItems = eqqProductsList2pace(products.additionalItems.products, products.additionalItems.label);

            var requestDataBom = {
                'currencyCode': currency,
                'content': electricals.concat(mechanicals).concat(distributions).concat(functionalUnits).concat(additional).concat(additionalItems)
            };
            //endregion

            var processedRequestData = {
                'header': requestDataHeader,
                'bom': requestDataBom
            };
            return JSON.stringify(processedRequestData);
        };


        function groupSameItems(rawProductsList, groupedProductsList, switchboardName) {

            _.each(rawProductsList, function (productPack) {

                var toAdd = true;
                /* Before adding a product Item to the BOM, check if it already exists or not.
                 * If it exist, just update the quantity and unflag the creation.
                 * If it does not exist, the creation flag will be left to true,
                 * and this new product item will be added to the list.
                 */
                for (var i = 0; i < groupedProductsList.length; i++) {
                    var elem = groupedProductsList[i];
                    if (switchboardName === elem.switchboardName && auxiliariesService.getProductReferences(elem.product).join('_') === auxiliariesService.getProductReferences(productPack.product).join('_')) {
                        // create a new instance to auto-update prices and (HACK WBA) avoid AngulaJS objects cache
                        var copyProductPack = new ProductPack(elem.product, (elem.quantity + productPack.quantity), {}, []);
                        copyProductPack.switchboardName = elem.switchboardName;

                        groupedProductsList[i] = copyProductPack;
                        toAdd = false;
                        break;
                    }
                }

                if (toAdd) {
                    productPack.switchboardName = switchboardName;
                    groupedProductsList.push(productPack);
                }
            });

            return groupedProductsList;
        }

        var updatePaceBomJsonModel = function () {

            $scope.bom = bomManagementService.getBom();


            if ($scope.fullBom) {
                populateBomContent(Project.current.switchboardPacks);
            }
            else {
                populateBomContent([{quantity: 1, switchboard: Project.current.selectedSwitchboard}]);
            }

            var currency = appConstants.currency;
            //use current culture as language to export the bom
            var culture = translationService.getLocale();
            var bomObject = {
                'products': {
                    'electricProducts': {
                        'products': electricProductsList,
                        'label': gettextCatalog.getString('enclosure-electrical-products')
                    },
                    'mechanicProducts': {
                        'products': mechanicProductsList,
                        'label': gettextCatalog.getString('enclosure-mechanical-products')
                    },
                    'distributionProducts': {
                        'products': distributionProductsList,
                        'label': gettextCatalog.getString('enclosure-distribution-products')
                    },
                    'functionalUnitsProducts': {
                        'products': functionalUnitsProductsList,
                        'label': gettextCatalog.getString('bom-functional-units-list')
                    },
                    'additionalProducts': {
                        'products': additionalProductsList,
                        'label': gettextCatalog.getString('bom-additional-products-list')
                    },
                    'additionalItems': {
                        'products': additionalItemList,
                        'label': gettextCatalog.getString('bom-additional-items-list')
                    }
                },
                'currency': currency,
                'culture': culture, 'columns': [
                    {
                        'id': 'reference',
                        'label': gettextCatalog.getString('bom-reference-label'),
                        'type': 'String'
                    },
                    {
                        'id': 'quantity',
                        'label': gettextCatalog.getString('bom-quantity-label'),
                        'type': 'Number'
                    },
                    {
                        'id': 'description',
                        'label': gettextCatalog.getString('bom-product-label'),
                        'type': 'String'
                    },
                    {
                        'id': 'unitPrice',
                        'label': gettextCatalog.getString('bom-unit-price-label'),
                        'type': 'Price'
                    },
                    {
                        'id': 'discount',
                        'label': gettextCatalog.getString('bom-discount-label'),
                        'type': 'Percentage'
                    },
                    {
                        'id': 'UNIT_NET_PRICE',
                        'label': gettextCatalog.getString('bom-unit-net-price-label'),
                        'type': 'Price'
                    },

                    {
                        'id': 'NET_PRICE',
                        'label': gettextCatalog.getString('bom-price-label'),
                        'type': 'Price',
                        'hasTotal': true
                    }
                ]
            };
            var jsonBom = genrateBomAsJson(bomObject.columns, bomObject.products, bomObject.currency, bomObject.culture);
            console.log('========================= JSON BOM =========================');
            console.log(jsonBom);
            console.log('============================================================');
            $scope.bom.readJsonOrString(jsonBom);
            return jsonBom;
        };

        function checkDirtyState() {
            // don't have to show enclosure if the solution is in a dirty state
            if (Project.current.selectedSwitchboard.isSolutionDirty) {
                Project.current.selectedSwitchboard.mechanicBasket.clearProducts();
                Project.current.selectedSwitchboard.functionalUnitsBasket.clearProducts();
            }
        }

        checkDirtyState();

        //set url temporary to internal pace
        bomManagementService.setServerUrl(productPriceService.paceBomUrl + 'api/v1/');

        // Get the bom from service
        $scope.bom = bomManagementService.getBom();

        updatePaceBomJsonModel();

        // this variable is used to avoid binding directly view to data model and be able to do some verification before changing value
        $scope.isConvertingToSmartPanel = false;

        //Initialize price list in scope
        $scope.selectedPricelist = Project.current.priceList;

        var publicPriceListTranslatedName = function () {
            var pricesDate = productPriceService.publicPriceApplicationDate;

            var fullYear = pricesDate.getFullYear();
            var fullMonth = pricesDate.getMonth() + 1;
            var fullDay = pricesDate.getDate();

            if (fullMonth < 10) {
                fullMonth = '0' + fullMonth;
            }
            if (fullDay < 10) {
                fullDay = '0' + fullDay;
            }

            return gettextCatalog.getString('CountryPriceList') + ' (' + fullDay + '/' + fullMonth + '/' + fullYear + ')';
        };

        $scope.selectedPricelistLocalizedName = function () {
            if (Project.current.priceList !== undefined) {
                if (Project.current.priceList.type === 'PUBLIC') {
                    return publicPriceListTranslatedName();
                }
                else {
                    return Project.current.priceList.name + ' ' + Project.current.priceList.description;
                }
            }
        };


        $scope.discountAvailable = function () {
            return loginService.getUser().authenticated;
        };

        function populateBomContent(switchboardsToDisplay) {

            electricProductsList = [];
            mechanicProductsList = [];
            distributionProductsList = [];
            functionalUnitsProductsList = [];
            additionalProductsList = [];
            additionalItemList = [];


            switchboardsToDisplay.forEach(function (switchboardPack) {

                if (!switchboardPack.isSelectedForBom && fullBom) {
                    return;
                }


                var switchboard = switchboardPack.switchboard;
                var switchboardName = '';
                //add switchboard key to product if full Bom
                if ($scope.fullBom) {
                    switchboardName = switchboard.name;
                }

                if (switchboardPack.switchboard.hasElectricalDeviceList()) {
                    electricProductsList = groupSameItems(switchboard.electricBasket.list, electricProductsList, switchboardName);
                }
                if (switchboardPack.switchboard.hasMechanicalDeviceList()) {
                    mechanicProductsList = groupSameItems(switchboard.mechanicBasket.list, mechanicProductsList, switchboardName);
                }

                $scope.baskets = [
                    {
                        'title': 'bom-switchboard-content',
                        'list': electricProductsList,
                        'price': function () {
                            return switchboard.electricBasket.getNetPrice();
                        }
                    },
                    {
                        'title': 'shell-enclosure',
                        'list': mechanicProductsList,
                        'price': function () {
                            return switchboard.mechanicBasket.getNetPrice();
                        }
                    }
                ];

                if (switchboardPack.switchboard.hasDistributionDeviceList() && switchboard.distributionBasket.list.length > 0) {
                    distributionProductsList = groupSameItems(switchboard.distributionBasket.list, distributionProductsList, switchboardName);
                    $scope.baskets.push(
                        {
                            'title': 'bom-distribution-list',
                            'list': distributionProductsList,
                            'price': function () {
                                return switchboard.distributionBasket.getNetPrice();
                            }
                        });
                }

                if (switchboardPack.switchboard.hasFunctionalUnitsDeviceList() && switchboard.functionalUnitsBasket.list.length > 0) {
                    functionalUnitsProductsList = groupSameItems(switchboard.functionalUnitsBasket.list, functionalUnitsProductsList, switchboardName);
                    $scope.baskets.push(
                        {
                            'title': 'bom-functional-units-list',
                            'list': functionalUnitsProductsList,
                            'price': function () {
                                return switchboard.functionalUnitsBasket.getNetPrice();
                            }
                        });
                }

                if (switchboardPack.switchboard.hasAdditionalProductsDeviceList() && switchboard.additionalProductsBasket.list && switchboard.additionalProductsBasket.list.length > 0) {
                    additionalProductsList = groupSameItems(switchboard.additionalProductsBasket.list, additionalProductsList, switchboardName);
                    $scope.baskets.push(
                        {
                            'title': 'bom-additional-products-list',
                            'list': additionalProductsList,
                            'price': function () {
                                return switchboard.additionalProductsBasket.getNetPrice();
                            }
                        });
                }

                if (switchboardPack.switchboard.hasAdditionalItemsList() && switchboard.additionalItemsBasket.list && switchboard.additionalItemsBasket.list.length > 0) {
                    additionalItemList = groupSameItems(switchboard.additionalItemsBasket.list, additionalItemList, switchboardName);
                    $scope.baskets.push(
                        {
                            'title': 'bom-additional-items-list',
                            'list': additionalItemList,
                            'price': function () {
                                return switchboard.additionalItemsBasket.getNetPrice();
                            }
                        });
                }

            });

        }

        $scope.selectPriceList = function (pricelist) {
            Project.current.priceList = pricelist;
            productPriceService.setDefaultPriceListId(pricelist.id);
            $scope.selectedPricelist = pricelist;
            partInfoService.updatePartsInfo(Project.current.priceList.id);
        };

        $scope.newPriceList = function () {

            var priceListServiceProvider = $injector.get('priceListService');

            priceListServiceProvider.setServerUrl(productPriceService.pacePriceBaseUrl + 'api/v2');
            priceListServiceProvider.setUserToken(loginService.getUser().userId);
            priceListServiceProvider.addCountryInList(appConstants.priceScope);


            // override name and description for FR and ES public lists
            var translations = {};
            translations[appConstants.priceScope] = {'name': ' ', 'description': gettextCatalog.getString('CountryPriceList')};

            priceListServiceProvider.setTranslationsForPublicLists(translations);

            discountEditorService.editDiscounts('Pricelist', $scope.selectPriceList);
        };

        $scope.editDiscount = function () {

            if ($scope.discountAvailable()) {
                var pricingServiceFactoryProvider = $injector.get('pricingServiceFactory');

                pricingServiceFactoryProvider.setBaseUrl(productPriceService.pacePriceBaseUrl + 'api/v2');
                pricingServiceFactoryProvider.setCountry(appConstants.priceScope);
                pricingServiceFactoryProvider.setToken(loginService.getUser().userId);

                discountEditorService.editDiscounts('UserDiscounts');
            }
        };

        partInfoService.registerPartUpdatedCallBack({
                Id: 'Bom' + $scope.fullBom,
                func: updatePaceBomJsonModel
            }
        );


        $scope.projectPrice = function () {
            return Project.current.selectedSwitchboard.getNetPrice();
        };

        /** Parcours en profondeur d'abord du switchboard organization */
        $scope.getOrganizationToArray = function (devicesList) {
            var devicesArray = [];
            for (var i = 0; i < devicesList.length; i++) {
                var currentDevice = devicesList[i];
                if (currentDevice.type !== 'distribution') {
                    // TODO create this attribute more clean
                    currentDevice.convert = true;
                    devicesArray.push(currentDevice);
                }
                var childrenArray = $scope.getOrganizationToArray(currentDevice.children);
                devicesArray = devicesArray.concat(childrenArray);
            }
            return devicesArray;
        };

        $scope.displaySmartPanelLink = function () {
            //see EQ-2048 appConstants.priceScope === 'RU'
            return false;
        };

        var redirectTo = function (path) {
            console.log('Redirecting to ' + path);
            $location.path(path);
        };

        $scope.convertToSmartPanel = function () {
            var products = $scope.getOrganizationToArray(Project.current.selectedSwitchboard.network.incomerDevices);
            var hadEnclosure = Project.current.selectedSwitchboard.mechanicBasket && Project.current.selectedSwitchboard.mechanicBasket.list && Project.current.selectedSwitchboard.mechanicBasket.list.length > 0;
            smartPanelWizzardService.runWizzard(products, hadEnclosure).result.then(function (result) {
                if (!!result && (result.selectedSmartifiedItems.length > 0 || result.additional.length > 0)) {

                    // if the current SW was not already smart, duplicate it. Overwrite content otherwise
                    if (Project.current.selectedSwitchboard.additionalProductsBasket && Project.current.selectedSwitchboard.additionalProductsBasket.list && Project.current.selectedSwitchboard.additionalProductsBasket.list.length === 0) {
                        $scope.saveBackup();
                    }

                    smartPanelTrackingService.smartPanelConversion(Project.current.getNetPrice());
                    // apply result.smartified to project
                    var productPackToConvert;
                    var productPackConverted;
                    for (var i = 0; i < result.selectedSmartifiedItems.length; i++) {
                        var smartifiedItem = result.selectedSmartifiedItems[i];
                        productPackToConvert = Project.current.selectedSwitchboard.electricBasket.searchProductPack(smartifiedItem.before.product);
                        productPackConverted = productPackToConvert.clone();
                        productPackConverted.product = smartifiedItem.after.product;
                        networkService.modifyDevice(smartifiedItem.before, productPackConverted);
                        delete smartifiedItem.before.convert;
                    }

                    // replace result.additional
                    Project.current.selectedSwitchboard.additionalProductsBasket.clearProducts();
                    var product = null;
                    for (var j = 0; j < result.additional.length; j++) {
                        product = result.additional[j].product;
                        var quantity = result.additional[j].quantity;
                        // TODO how to fill it?
                        var newProductPack = new ProductPack(product, quantity, {}, []);
                        Project.current.selectedSwitchboard.additionalProductsBasket.addProduct(newProductPack);
                    }

                    // make dirty
                    Project.current.selectedSwitchboard.mechanicBasket.clearProducts();
                    Project.current.selectedSwitchboard.functionalUnitsBasket.clearProducts();
                    projectService.makeProjectDirty();

                    // make clean the smartpanel state
                    Project.current.selectedSwitchboard.isSmartPanelDirty = false;

                    // update bom
                    updatePaceBomJsonModel();
                    logger.success(gettextCatalog.getString('CONVERT_TO_SMART_PANEL_SUCCESS'), 'auto-saved customer project, then start conversion', 'convertToSmartPanel', true, null, {showUser: true});

                    if (hadEnclosure) {
                        redirectTo('/enclosure');
                    }
                }

                $scope.isConvertingToSmartPanel = false;

            }, function (err) {
                logger.error(gettextCatalog.getString(err), err, 'convertToSmartPanel', true);
                $scope.isConvertingToSmartPanel = false;
            });
        };

        /**
         * Wrapper on disabled state for exports / converting BOM buttons
         * @returns {boolean} True if an operation on the BOM is pending, false otherwise
         */
        $scope.actionPendingOnBom = function () {
            return $scope.isConvertingToSmartPanel;
        };

        /**
         * Wrapper on the empty product list state
         * @returns {boolean} True if the whole product list is empty. False otherwise
         */
        $scope.isProductListEmpty = function () {
            return electricProductsList.length === 0 && mechanicProductsList.length === 0 && distributionProductsList.length === 0;
        };

        $scope.isItemsListEmpty = function () {
            return additionalItemList.length === 0;
        };

        $scope.isSolutionDirty = function () {
            return (Project.current.selectedSwitchboard.isSolutionDirty && Project.current.selectedSwitchboard.electricBasket.list.length !== 0);
        };

        $scope.isSmartPanelDirty = function() {
            return Project.current.selectedSwitchboard.isSmartPanelDirty;
        };

        if ($scope.baskets !== undefined && $scope.baskets[0] !== undefined && $scope.baskets[1] !== undefined) {
            // track in google analytics the fact that a bom has been displayed
            bomTrackingService.bomDisplayed();
        }

        if ($scope.isSolutionDirty()) {
            logger.warning(gettextCatalog.getString('ENCLOSURE_SOLUTION_DIRTY'), '', 'bom', true, null, {
                timeOut: 7000,
                showUser: true
            });
        }

        if ($scope.isSmartPanelDirty() && Project.current.selectedSwitchboard.additionalProductsBasket.getTotalProductCount() > 0) {
            logger.warning(gettextCatalog.getString('SMARTPANEL_SOLUTION_DIRTY'), '', 'bom', true, null, {
                timeOut: 7000,
                showUser: true
            });
        }

        var unregisterProductAddedEvent = $rootScope.$on('Product added', function () {
            updatePaceBomJsonModel();
        });

        var unregisterDiscountChangedEvent = $rootScope.$on('Discount changed', function () {
            partInfoService.updatePartsInfo(Project.current.priceList.id);
        });

        // Unregister the event listener when the current scope is destroyed.
        $scope.$on('$destroy', function () {
            unregisterProductAddedEvent();
            unregisterDiscountChangedEvent();
            partInfoService.unRegisterPartUpdatedCallBack({
                Id: 'Bom' + $scope.fullBom
            });
        });

        $scope.$watch(
            function() { return bomManagementService.getPrinting(); },
            function(bomPrintingFlagState) {
                if (bomPrintingFlagState) {
                    $scope.modalInstance = bomDialogService.showWarning(gettextCatalog.getString('bom-printing-tab-open'));
                } else if (!bomPrintingFlagState && $scope.modalInstance !== undefined){
                    $scope.modalInstance.close();
                }
            });


        $scope.addItemToPriceList = function() {

            var additionalItemsSwitchboardPack = _.find(Project.current.switchboardPacks, function(switchboardPack){
               return switchboardPack.type === 'other';
            });

            var additionalItems = [];

            if (additionalItemsSwitchboardPack){
                additionalItemsSwitchboardPack.switchboard.additionalItemsBasket.list.forEach(function(ProductPack){
                    var additionalItem = {};
                    additionalItem.name = ProductPack.product.parts[0].part.longName;
                    additionalItem.type = '';
                    additionalItem.price = ProductPack.product.parts[0].part.price;
                    additionalItems.push(additionalItem);
                });
            } else {
                additionalItemsSwitchboardPack = Project.current.createSwitchboard(gettextCatalog.getString('bom-other-switchboard'), 1, true, 'other');
            }

            addItemService.addItem(additionalItems).result.then(function (items){

                //empty additionalItemsBasket before filling it
                additionalItemsSwitchboardPack.switchboard.additionalItemsBasket.list = [];

                if (items !== undefined){
                    items.forEach(function(item){
                        var additionalPart = new Part(item.name, item.name, null, item.price);
                        additionalPart.isAdditional = true;
                        var additionalPartPacks = [];
                        additionalPartPacks.push(new PartPack(additionalPart, 1));
                        var additionalProduct = new Product(additionalPartPacks);
                        var additionalProductPack = new ProductPack(additionalProduct, 1);
                        additionalItemsSwitchboardPack.switchboard.additionalItemsBasket.addProduct(additionalProductPack);
                    });
                }

                updatePaceBomJsonModel();
            });
        };
    });
