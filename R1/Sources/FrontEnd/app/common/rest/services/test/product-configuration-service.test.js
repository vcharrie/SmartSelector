'use strict';

/**
 * Tests for rest-product-configuration-service
 */
describe('product-configuration-service', function () {
  var productConfigurationService,
    apiHelper,
    q,
    rootScope,
    logger,
    httpBackend,
    Product,
    Part,
    ProductPack;

  beforeEach(function () {
    module('rest');
  });

  beforeEach(inject(function (_productConfigurationService_, _apiHelper_, $q, $rootScope, _logger_, $httpBackend, _ProductPack_, _Product_, _Part_) {
    productConfigurationService = _productConfigurationService_;
    apiHelper = _apiHelper_;
    q = $q;
    rootScope = $rootScope;
    logger = _logger_;
    httpBackend = $httpBackend;
    Product = _Product_;
    Part = _Part_;
      ProductPack = _ProductPack_;
  }));

  it('should make a test', function () {
  });

});