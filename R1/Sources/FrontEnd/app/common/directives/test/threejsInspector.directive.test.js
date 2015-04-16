'use strict';

/**
 * Tests for threejs inspector directive
 */
describe('threejs inspector directive', function () {

    var element, scope;


    beforeEach(function () {
            module('helpers');
            module('directives');
            // load app templates (including the directive's template definitions needed here)
            module('app.templates');
        }
    );

    beforeEach(inject(function ($rootScope, $compile) {
        scope = $rootScope.$new();

        element = '<threejs-inspector viewer="viewer"></threejs-inspector>';

        element = $compile(element)(scope);

        scope.$digest();
    }));

    it('should contains a list element in the template', function () {
        expect(element.find('ul')).not.toBeNull();
    });

    it('should be scrollable', function() {
       expect(element.find('div').hasClass('scrollable')).toBe(true);
    });

    it('should get the viewer property on its isolated scope', function() {
        scope.viewer = {};

        scope.$digest();

        var isolated = element.isolateScope();
        expect(scope.viewer === isolated.viewer).toBe(true);
    });

    it('should initialize an empty children array on its isolated scope', function() {
        scope.viewer = null;
        scope.$digest();

        var isolated = element.isolateScope();
        expect(isolated.children).not.toBe(null);
        expect(isolated.children.length).toBe(0);
    });

    it('should watch scope.viewer property to register <loaded> event listener', function() {
        scope.viewer = null;
        scope.$digest();

        var called = false;
        scope.viewer = {
            scene: {
                addEventListener: function() {
                    called = true;
                }
            }
        };

        scope.$digest();

        expect(called).toBe(true);
    });
});