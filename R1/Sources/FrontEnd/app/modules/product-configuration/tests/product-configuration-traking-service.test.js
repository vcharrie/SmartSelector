'use strict';

/**
 * Tests for product-configuration-traking-service
 */
describe('product-configuration-traking-service', function () {
    var productConfigurationTrackingService,
        apiHelper,
        q,
        rootScope,
        logger,
        httpBackend,
        Product,
        Part,
        ProductPack,
        googleAnalyticsService;

    beforeEach(function () {
        module('productConfiguration');
    });

    beforeEach(inject(function (_productConfigurationTrackingService_, _apiHelper_, $q, $rootScope, _logger_, $httpBackend, _ProductPack_, _Product_, _Part_, _googleAnalyticsService_) {
        productConfigurationTrackingService = _productConfigurationTrackingService_;
        googleAnalyticsService = _googleAnalyticsService_;
        apiHelper = _apiHelper_;
        q = $q;
        rootScope = $rootScope;
        logger = _logger_;
        httpBackend = $httpBackend;
        Product = _Product_;
        Part = _Part_;
        ProductPack = _ProductPack_;

        // mocks
        googleAnalyticsService = jasmine.createSpyObj('googleAnalyticsService', ['sendEvent']);
        googleAnalyticsService.sendEvent.andCallFake(function(category, action, label) {return true;});
    }));

    it('should be able to send a product added to our "friend" Google', function () {
        //create two fake products
        var part0 = new Part('partCode0', 'partLongName0', 'resCode0');
        var part1 = new Part('partCode1', 'partLongName1', 'resCode1');
        var product0 = new Product([part0, part1]);

        // TODO WBA : ask GG about rewire
        //productConfigurationTrackingService.productAdded(product0);
        //expect(googleAnalyticsService.sendEvent).toHaveBeenCalled();
    });
});