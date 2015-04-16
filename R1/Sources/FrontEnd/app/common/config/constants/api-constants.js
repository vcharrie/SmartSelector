/**
 * @class angular_module.config.apiConstants
 */
angular.module('config').constant('apiConstants', {
    'baseUri': 'https://sqe.ecoreal.schneider-electric.com/es',

    'partsInfo':                                '/ReferenceInformationService/api/v1/parts-info',
    'defaultValues':                            '/ProductConfigurationService/api/v1/default-values',
    'auxiliariesDefaultValues':                 '/ProductConfigurationService/api/v1/auxiliaries-default-values',
    'distributionsDefaultValues':               '/ProductConfigurationService/api/v1/distributions-default-values',
    'defaultValuesWishes':                      '/ProductConfigurationService/api/v1/default-values-wishes',
    'electricalSequentialFilter':               '/ProductConfigurationService/api/v1/electrical-sequential-filter',
    'references':                               '/ProductConfigurationService/api/v1/references',
    'electricalReferences':                     '/ProductConfigurationService/api/v1/electrical-references',
    'productInfo':                              '/ProductConfigurationService/api/v1/product-info',
    'rangeOrders':                              '/ProductConfigurationService/api/v1/range-orders',
    'getProductInformation':                    '/ProductConfigurationService/api/v1/get-product-configurations',
    'getElectricalFilterPossibleValues':        '/ProductConfigurationService/api/v1/electrical-filter-possible-values',
    'getMechanicalFilterPossibleValues':        '/ProductConfigurationService/api/v1/mechanical-filter-possible-values',
    'getDistributionFilterPossibleValues':      '/ProductConfigurationService/api/v1/distribution-filter-possible-values',
    'getAuxiliariesFilterPossibleValues':       '/ProductConfigurationService/api/v1/auxiliaries-filter-possible-values',
    'getCompatibleElectricalProducts':          '/ProductConfigurationService/api/v1/get-compatible-electrical-products',
    'hasCompatibleAuxiliaries':                 '/ProductConfigurationService/api/v1/has-compatible-auxiliaries',
    'getInvalidProducts':                       '/ProductConfigurationService/api/v1/get-invalid-products',
    'getReferenceCollection':                   '/ProductConfigurationService/api/v1/reference-collection/',

    'getCompatibleDistributions':               '/DistributionConfigurationService/api/v1/get-compatible-distributions',

    'searchEnclosures':                         '/ProductConfigurationService/api/v1/search-enclosure-products',
    'searchDistributions':                      '/ProductConfigurationService/api/v1/search-distribution-products',

    'solutionsFind':                            '/SwitchboardEngine/api/v1/solutions/find',
    'solutionsFindSwitchboardSolution':         '/SwitchboardEngine/api/v1/solutions/findSwitchboardSolution',
    'solutionGenerate3d':                       '/SwitchboardEngine/api/v1/solutions/generate3d',
    'solutionGenerate3dAdmin':                  '/SwitchboardEngine/api/v1/admin/solutions/generate3d',
    'solutionGenerateCompositionScriptAdmin':   '/SwitchboardEngine/api/v1/admin/solutions/generateCompositionScript',

    'applicationConfiguration':                 '/ApplicationConfigurationService/api/v1/parameter',
    'updateApplicationConfiguration':           '/ApplicationConfigurationService/api/admin/v1/parameter',

    'compositionExplodeReferences':             '/3d/rest/3dcomposer/v1/exploded-composition',
    'compositionExplodeDrawings':               '/3d/rest/3dcomposer-admin/v1/exploded-composition',
    'compositionGetSymbols':                    '/3d/rest/3dcomposer-admin/v1/models',
    'compositionGetReferences':                 '/3d/rest/3dcomposer-admin/v1/references',
    'compositionGetReferencePoints':            '/3d/rest/3dcomposer-admin/v1/reference-points',
    'compositionGetSymbolsFromReferences':      '/3d/rest/3dcomposer-admin/v1/symbols',
    'compositionScript':                        '/3d/rest/3dcomposer-admin/v1/composition',

    'compositionScriptV1.1':                    '/3d/rest/3dcomposer-admin/v1.1/composition',
    'compositionExplodeReferencesV1.1':         '/3d/rest/3dcomposer/v1.1/exploded-composition',
    'compositionExplodeDrawingsV1.1':           '/3d/rest/3dcomposer-admin/v1.1/exploded-composition',

    'smartPanelConversion':                     '/SmartPanelService/api/v1/smartpanel/convert',
    'smartPanelSmartify':                       '/SmartPanelEngine/api/v1/smartpanel/smartify',
    'smartPanelSmartifyDevices':                '/SmartPanelEngine/api/v1/smartpanel/smartifyDevices',
    'smartPanelSmartifyPanel':                  '/SmartPanelEngine/api/v1/smartpanel/smartifyPanel',

    'loginApiUserInfo':                         'api/v1/user',
    'serviceUrl':                               '/ApplicationConfigurationService/api/v1/url-services',
    'serverEnvironment':                        '/ApplicationConfigurationService/api/v1/server-environment-services',
    'logoutApiUser':                            '/disconnect',
    'refreshToken':                             '/getToken?new=true',

    //Discovers API
    'discoversList':                            '/discovers/{language}/discovers.json',
    'discoversDetail':                          '/discovers/{language}/{discoverId}/{discoverId}.json',

    //Price date applications
    'priceApplicationDates':                    '/pacedateprice/pricedate.json',

    //blM apis
    'blmSpimApiBase':                           'spim/',
    'blmSpimDocumentApiBase':                   'spim-document/',
    'blmSpimDocument':                          'document/{documentID}',
    'blmProjects':                              'items',
    'blmItem':                                  'items/{itemID}',
    'blmSubItems':                              'items/{itemID}/childItems',
    'blmItemsByte':                             'items/{itemID}/bytes',

    //Pace Price apis
    'pacePriceDiscountApiBase':                 'api/v1/discount',
    'pacePriceLists':                           '/api/v2/pricelists'
});