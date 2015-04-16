'use strict';

/**
 * Tests for search solution service
 */
describe('search solution service', function () {
    var service,
        apiConstants,
        httpBackend,
        testHelperFactory,
        auxiliariesService;

    beforeEach(function () {
        module('rest','ngCookies', function($provide) {
            $provide.value('adminService', {});
            $provide.value('googleAnalyticsService', {});
        });
        module('testHelper');
    } );

    beforeEach(inject(function (_searchSolutionService_, _auxiliariesService_, _apiConstants_, _testHelperFactory_, $httpBackend) {
        service = _searchSolutionService_;
        auxiliariesService = _auxiliariesService_;
        apiConstants = _apiConstants_;
        testHelperFactory = _testHelperFactory_;
        httpBackend = $httpBackend;
    }));

    describe('when we search solution', function() {
//       it ('should work', function() {
//           // setup
//           service.updateMechanicalFilters = function(){
//               return {
//                   then: function(callback) {
//                       callback({
//                           enclosureFilters: [],
//                           distributionFilters: []
//                       });
//                   }
//               };
//           };
//           httpBackend.whenPOST(apiConstants.solutionsFind).respond([]);
//           var productPack = testHelperFactory.createProductPack();
//
//           // act
//           service.searchSolution(
//             [productPack],        // product items
//             [],        // enclosure filters
//             [],        // distribution filters
//             true       // skip distribution
//           );
//
//           // check
//           httpBackend.expectPOST(
//               apiConstants.solutionsFind,
//               {
//                    enclosureCharacteristics: [],
//                    mainDistributionCharacteristics : [],
//                    products: [{name: auxiliariesService.getMainPartsUnderscoredReferences(productPack.product), auxiliaries: auxiliariesService.getAuxiliariesReferences(productPack.product), quantity: productPack.quantity}],
//                    freeSpace: 0,
//                    skipDistribution: true
//               });
//           httpBackend.flush();
//       });
    });
});