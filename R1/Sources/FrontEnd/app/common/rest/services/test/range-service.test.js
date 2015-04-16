'use strict' ;

/**
 * Tests for range-service
 */
describe('range-service', function() {


    var rangeService;
    var rootScope;
    var applicationConfigurationService;
    var Q;

    var httpBackend;


    beforeEach(function() {
        module('rest');

    });

    beforeEach(inject(function($rootScope, _rangeService_, $httpBackend, _applicationConfigurationService_, $q) {
        rangeService = _rangeService_;
        rootScope = $rootScope.$new();
        httpBackend = $httpBackend;
        applicationConfigurationService = _applicationConfigurationService_ ;
        Q = $q;
    }));

    afterEach(inject(function($rootScope) {
        $rootScope.$apply();
    }));

    it('should load range items', function() {

        var getApplicationParameterPromise = Q.defer();
        spyOn(applicationConfigurationService, 'getApplicationParameter').andCallFake(function(){
            getApplicationParameterPromise.resolve({parameterObject : {
                rangeItems : [{
                    permanentFilters : [{
                        characteristic : 'characteristic1',
                        operator : 'operator1',
                        values : 'values1'
                    },{
                        characteristic : 'characteristic2',
                        operator : 'operator2',
                        values : 'values2'
                    }],
                    rangeName : 'rangeName',
                    pictureUrl : 'pictureUrl',
                    mainCharacteristics : ['charac1', 'charac2']
                }]
            }});
            return getApplicationParameterPromise.promise;
        });

        rangeService.loadRangeItems();

        rootScope.$apply();

        expect(rangeService.getRangeItems().length).toBe(1);
        var rangeItem = rangeService.getRangeItems()[0] ;
        expect(rangeItem.rangeName).toBe('rangeName');
        expect(rangeItem.pictureUrl).toBe('pictureUrl');
        expect(rangeItem.mainCharacteristics.length).toBe(2);


    });
});


