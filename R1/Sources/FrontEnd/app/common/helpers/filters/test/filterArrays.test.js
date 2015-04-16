'use strict';

describe('filterArrayFilters tests', function() {

    var filterMin;
    var filterMax;

    beforeEach(function() {
        module('helpers');

        // Inject in angular constructs otherwise,
        //  you would need to inject these into each test
        inject(function($filter) {
            filterMin = $filter('min');
            filterMax = $filter('max');
        });

    });


    it('should take out max of array', function() {

        // Arrange
        var t1 = [{ price: 1, len: 1 },
            { price: 1, len: 3 },
            { price: 3, len: 7 },
            { price: 1, len: 5 },
            { price: 1, len: 6 },
            { price: 1, len: 4 },
            { price: -1, len: 9 }];


        // Assert
        expect(filterMin).toBeDefined();
        expect(filterMax).toBeDefined();

        expect(filterMax(t1, 'price')).toEqual([{ price: 3, len: 7 }]);
        expect(filterMax(t1, 'len')).toEqual([{ price: -1, len: 9 }]);

        expect(filterMin(t1, 'price')).toEqual([{ price: -1, len: 9 }]);
        expect(filterMin(t1, 'len')).toEqual([{ price: 1, len: 1 }]);


    });
});
