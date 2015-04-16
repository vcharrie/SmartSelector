'use strict';

/**
 * Tests for product-configuration
 */
describe('productConfiguration controller', function () {

    var scope,
        rootScope,
        ctrl,
        logger,
        productConfigurationService,
        httpBackend,
        RangeItem,
        productConfigurationTrackingService,
        Part,
        Product,
        partInfoService,
        rangeService,
        q,
        _;

  // Load angular module
  beforeEach(function () {
      module('productConfiguration');
      module('helpers');
    }
  );

    // Dependencies injection
    beforeEach(inject(function (_$q_, $rootScope, $controller, $httpBackend, _logger_, _productConfigurationService_, _RangeItem_, _Part_, _Product_, _partInfoService_, _rangeService_, $injector) {

        _ = $injector.get('_');

        // Mocks
        logger = _logger_;
        productConfigurationService = _productConfigurationService_;
        httpBackend = $httpBackend;
        RangeItem = _RangeItem_;
        Part = _Part_;
        Product = _Product_;
        partInfoService = _partInfoService_;
        rangeService = _rangeService_;
        q = _$q_;

        productConfigurationTrackingService =  jasmine.createSpyObj('productConfigurationTrackingService',
            ['clearSelectedCharacteristics',
            'characSelected',
            'characUnselected',
            'productAdded']);
        productConfigurationTrackingService.clearSelectedCharacteristics.andCallFake(function() {return true;});
        productConfigurationTrackingService.characSelected.andCallFake(function(chara) {return true;});
        productConfigurationTrackingService.characUnselected.andCallFake(function(chara) {return true;});
        productConfigurationTrackingService.productAdded.andCallFake(function(product) {return true;});

        // backend mocks
        var rngItm = new RangeItem('name', 'type', 'picture.png', 'modulars', [], [], []);
        httpBackend.when('GET', 'ProductConfigurationService/api/db/modulars/filter?').respond(rngItm);

        // promise resolution mocks and spies
        var deferred = _$q_.defer();
        var part0 = new Part('partCode0', 'partLongName0', 'resCode0');
        var part1 = new Part('partCode1', 'partLongName1', 'resCode1');
        var product0 = new Product([part0, part1]);
        var part2 = new Part('partCode2', 'partLongName2', 'resCode2');
        var part3 = new Part('partCode3', 'partLongName3', 'resCode3');
        var product1 = new Product([part2, part3]);
        deferred.resolve([product0, product1]);
        spyOn(partInfoService, 'getDetailedProducts').andReturn(deferred.promise);

        // pass all to the controller
        scope = $rootScope.$new();
        rootScope = $rootScope;
        ctrl = $controller('productConfiguration', {
                $scope: scope,
                logger: logger,
                productConfigurationService: productConfigurationService,
                Product: Product,
                productConfigurationTrackingService: productConfigurationTrackingService,
                partInfoService: partInfoService,
                rangeService: rangeService
            }
        );
    }));
});
