'use strict' ;

/**
 * Tests for part-info-service
 */
describe('partInfoService', function() {

    var loginService;
    var partInfoService;
    var Q;
    var httpBackend;
    var apiHelper;
    var rootScope;
    var adminService;
    var auxiliariesService;
    var SUDO_MODE_ENABLED;

    beforeEach(function() {
        module('rest','ngCookies', function($provide) {
            $provide.value('SUDO_MODE_ENABLED', false);
            $provide.value('googleAnalyticsService', {});
        });
    });

    beforeEach(inject(function(_loginService_,
        _partInfoService_,
        $q, $httpBackend, $rootScope,
        _apiHelper_, _adminService_,_auxiliariesService_, _SUDO_MODE_ENABLED_) {
        loginService=_loginService_;
        partInfoService = _partInfoService_;
        Q = $q;
        httpBackend = $httpBackend;
        apiHelper = _apiHelper_;
        rootScope = $rootScope;
        adminService = _adminService_;
        auxiliariesService = _auxiliariesService_;
        SUDO_MODE_ENABLED = _SUDO_MODE_ENABLED_;
    }));

    it('should get a detailed products promise', function() {
        // prepare
        var productsRefsToAsk = [ ['A9F74601', 'A9Q10225'], ['A9F73601', 'A9Q10225'] ];
        var detailledProdctsInfo = [
            {
                'Nb_9mm': '4',
                'partCode': 'A9F74601',
                'resCode': '.\\Data\\Documents\\Pictures\\Devices\\PB104437_web.jpg',
                'longName': 'iC60N - Interruptor automático magnetotérmico - 1P + N - 1A - curva C',
                'shortName': 'iC60N - Interruptor automático magnetot',
                'price': '83.43135'
            },
            {
                'Nb_9mm': '6',
                'partCode': 'A9F73601',
                'resCode': '.\\Data\\Documents\\Pictures\\Devices\\PB104433_web.jpg',
                'longName': 'iC60N - Interruptor automático magnetotérmico - 2P + N - 1A - curva C',
                'shortName': 'iC60N - Interruptor automático magnetot',
                'price': '85.43135'
            },
            {
                'Nb_9mm': '3',
                'partCode': 'A9Q10225',
                'resCode': '.\\Data\\Documents\\Pictures\\Devices\\PB106265_web.jpg',
                'longName': 'Quick Vigi iC60 - Bloque diferencial - 2P - 25A - 10mA - clase AC',
                'shortName': 'Quick Vigi iC60 - Bloque diferencial -',
                'price': '343.8259'
            }
        ];

        var getDetailedProductsPromise = Q.defer();
        spyOn(apiHelper, 'post').
        andCallFake(function() {
            getDetailedProductsPromise.resolve(detailledProdctsInfo);
            return getDetailedProductsPromise.promise;
        });

        spyOn(adminService, 'getLocale').andCallFake(function() {return 'en-US';});

        // act
        partInfoService.getDetailedProducts(productsRefsToAsk).then(function(productList) {
            var testResults = productList;
            var product01 = testResults[0];
            var product02 = testResults[1];

            // expect(auxiliariesService.getUnderscoredReferences(product01)).toEqual(productsRefsToAsk[0]);
            expect(product01.parts.length).toEqual(productsRefsToAsk.length);
            expect(product01.parts[0].part.partCode).toEqual('A9F74601');
            expect(product01.parts[1].part.partCode).toEqual('A9Q10225');

            // expect(auxiliariesService.getUnderscoredReferences(product02)).toEqual(productsRefsToAsk[1]);
            expect(product02.parts.length).toEqual(productsRefsToAsk.length);
            expect(product02.parts[0].part.partCode).toEqual('A9F73601');
            expect(product02.parts[1].part.partCode).toEqual('A9Q10225');
        });

        httpBackend.expectGET('/ProductConfigurationService/api/v1/range-orders').respond(200);

        rootScope.$apply();
    });

});
