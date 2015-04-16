'use strict';

/**
 * Tests for product-configuration-service
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
    module('productConfiguration');
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

});