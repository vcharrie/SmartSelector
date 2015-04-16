'use strict';

/**
 * Tests for enclosure controller
 */
describe('enclosure controller', function () {

    var scope,
        ctrl,
        controller,
        logger,
        rootScope,
        httpBackend,
        searchSolutionService,
        q,
        apiConstants,
        appConstants;

    beforeEach(function () {
            module('enclosure');
        }
    );

    // Create new project
    beforeEach(inject(function (_projectService_) {
        _projectService_.createNewProject();
    }));

    // Dependencies injection
    beforeEach(inject(function (_$q_, $rootScope, $controller, _logger_, $httpBackend, _apiConstants_, _appConstants_) {
        rootScope = $rootScope;
        controller = $controller;
        logger = _logger_;
        httpBackend = $httpBackend;
        q = _$q_;
        apiConstants = _apiConstants_;
        appConstants = _appConstants_;

        searchSolutionService = jasmine.createSpyObj('searchSolutionService', [
            'searchSolution'
        ]);
        searchSolutionService.searchSolution.andCallFake(
            function () {
                return { then: function () {
                }};
            });
    }));

    function createController() {
        scope = rootScope.$new();
        ctrl = controller(
            'enclosure', {
                $scope: scope,
                searchSolutionService: searchSolutionService,
                appConstants: appConstants
            });
    }
/*
    JAS: no longer meaningful but kept the example for future new unit tests...
    it('gives the skip distribution app constants parameter to the search solution service 1', function () {
        // setup
        appConstants.skipFindDistribution = true;
        createController();

        // act
        scope.searchSolution();

        // check
        expect(searchSolutionService.searchSolution).toHaveBeenCalledWith(
            jasmine.any(Object), // product list
            jasmine.any(Object), // filters
            undefined,           // distribution filters
            true                 // skip distribution
        );
    });
*/
});
