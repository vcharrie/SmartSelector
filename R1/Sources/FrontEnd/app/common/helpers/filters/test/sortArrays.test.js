'use strict';

describe('arraySortFilters tests', function() {

    var orderBy1210ab;
    var orderByAb1210;

    beforeEach(function() {
        module('helpers');


        // Provide any mocks needed
        module(function($provide) {
            //$provide.value('Name', new MockName());
        });

        // Inject in angular constructs otherwise,
        //  you would need to inject these into each test
        inject(function($filter) {
            orderBy1210ab = $filter('orderBy1210ab');
            orderByAb1210 = $filter('orderByAb1210');
        });

    });


    it('should extend sort string tables', function() {

        // Arrange


        // Assert
        expect(orderBy1210ab).toBeDefined();
        expect(orderByAb1210).toBeDefined();

        expect(orderBy1210ab(['1', '2', '3', '4', '5', '6'])).toEqual(['1', '2', '3', '4', '5', '6']);
        expect(orderBy1210ab(['a1', '2.3', 'a3', '4', '5', '6a'])).toEqual(['2.3', '4', '5', '6a', 'a1', 'a3']);
		expect(orderBy1210ab(['', '1', '1', '10', '2', '11'])).toEqual(['1', '1',  '2','10', '11','']);
		expect(orderBy1210ab(['', ''])).toEqual(['','']);
        expect(orderBy1210ab(['b', 'a'])).toEqual(['a', 'b']);
		expect(orderBy1210ab(['1.1', '1.1'])).toEqual(['1.1', '1.1']);		
		expect(orderBy1210ab(['1.1', ''])).toEqual(['1.1', '']); 
		expect(orderBy1210ab([' 1.1', '1.1'])).toEqual(['1.1', ' 1.1']);
		expect(orderBy1210ab(['1.1a', '1.1b'])).toEqual(['1.1a', '1.1b']);		
        expect(orderBy1210ab(['1.1b', '1.1a'])).toEqual(['1.1a', '1.1b']);
	  
        expect(orderByAb1210(['1', '2', '3', '4', '5', '6'])).toEqual(['1', '2', '3', '4', '5', '6']);
        expect(orderByAb1210(['a1', '2.3', 'a3', '4', '5', '6a'])).toEqual(['a1', 'a3', '2.3', '4', '5', '6a']);
        expect(orderByAb1210(['', '1', '1', '10', '2', '11'])).toEqual(['','1', '1',  '2','10', '11']);
		expect(orderByAb1210(['', ''])).toEqual(['','']);
        expect(orderByAb1210(['b', 'a'])).toEqual(['a', 'b']);
		expect(orderByAb1210(['1.1', '1.1'])).toEqual(['1.1', '1.1']);		
		expect(orderByAb1210(['1.1', ''])).toEqual(['','1.1']); 
		expect(orderByAb1210([' 1.1', '1.1'])).toEqual([' 1.1','1.1']);
		expect(orderByAb1210(['1.1a', '1.1b'])).toEqual(['1.1a', '1.1b']);		
        expect(orderByAb1210(['1.1b', '1.1a'])).toEqual(['1.1a', '1.1b']);

    });
});
