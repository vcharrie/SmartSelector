'use strict';

/**
 * Tests for apiService
 */
describe('string helper Service', function() {

    var stringHelper;

    beforeEach(function() {

        module('helpers');


        inject(function($injector) {
            stringHelper = $injector.get('stringHelper');

        });


    });

    it('string helper', function() {

        // Arrange


        // Assert
        expect(stringHelper).toBeDefined();


        expect(stringHelper.format('{0} test', 0)).toEqual('0 test');

        expect(stringHelper.format('{0} {1} test {2}', 0, 'un', 'deux')).toEqual('0 un test deux');
        expect(stringHelper.format('test {1}')).toEqual('test {1}');
        expect(stringHelper.format('test {1}'), 0).toEqual('test {1}');
        expect(stringHelper.format()).toEqual('');
    });
});

 