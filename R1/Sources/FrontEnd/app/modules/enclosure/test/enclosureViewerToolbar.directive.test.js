'use strict';

/**
 * Tests for threejs toolbar directive
 */
describe('encosure viewer toolbar directive', function () {

    var element, scope, Q, httpBackend;

    beforeEach(function () {
            module('enclosure');
            // load app templates (including the directive's template definitions needed here)
            module('app.templates');
        }
    );

    beforeEach(inject(function ($rootScope, $compile, $q, $httpBackend) {
        scope = $rootScope.$new();
        Q = $q;
        httpBackend = $httpBackend;

        element = '<enclosure-viewer-toolbar viewer="viewer" solution="solution" on-screenshot-generate="screenshotGenerate"></enclosure-viewer-toolbar>';
        element = $compile(element)(scope);

        httpBackend.expectGET('/ProductConfigurationService/api/v1/range-orders').respond(200);

        scope.$digest();
    }));

    it('should contains a button group in the template', function () {
        expect(element.find('.btn-group')).not.toBeNull();
    });

    it('should get the viewer property on its isolated scope', function() {
        // setup
        initializeScope();

        // act
        scope.$digest();

        // check
        var isolated = element.isolateScope();
        expect(scope.viewer === isolated.viewer).toBe(true);
    });

    it('should call view.zoomExtents when the set view front button is clicked', function() {
        // setup
        initializeScope();
        spyOn(scope.viewer, 'zoomExtents');

        // act
        scope.$digest();
        findButtonById('set-view-front').click();

        // check
        expect(scope.viewer.zoomExtents).toHaveBeenCalled();
    });

    it('should call viewer.exportPicture when the set view front button is clicked', function() {
        // setup
        initializeScope();
        spyOn(scope.viewer, 'exportPicture').andReturn(Q.defer().promise);

        // act
        scope.$digest();
        findButtonById('enc-toolbar-screenshot').click();

        // check
        expect(scope.viewer.exportPicture).toHaveBeenCalled();
    });

    it('should call the scope.screenshotGenerate handler is it is defined', function() {
        // setup
        initializeScope();
        var deferred = Q.defer();
        spyOn(scope.viewer, 'exportPicture').andReturn(deferred.promise);
        spyOn(scope, 'screenshotGenerate');

        // act
        scope.$digest();
        deferred.resolve();
        findButtonById('enc-toolbar-screenshot').click();

        // check
        expect(scope.screenshotGenerate).toHaveBeenCalled();
    });

    it('should hide the toolbar if the viewer does not support webgl', function() {
        // setup
        initializeScope();

        // act
        scope.$digest();

        // check
        expect($(element).hasClass('ng-hide')).toBe(true);
    });

    function findButton(innerText){
        return $(element).find('button:contains('+ innerText + ')');
    }

    function findButtonById(elementId){
        return $(element).find('#' + elementId);
    }

    function initializeScope() {
        var viewer = {
            hasWebGL: false,
            zoomExtents: function() {},
            exportPicture: function() {}
        };

        scope.screenshotGenerate = function() {};
        scope.viewer = viewer;
        scope.solution = {
            width : 0,
            height : 0,
            depth : 0
        };
    }
});