'use strict';

/**
 * Tests for theme
 */
describe('theme controller', function () {

  var scope, ctrl;

  // Load angular module
  beforeEach(function () {
      module('theme');
    }
  );

  // Dependencies injection
  beforeEach(inject(function ($rootScope, $controller) {
    // Mocks
    scope = $rootScope.$new();

    ctrl = $controller('theme', {
        $scope: scope
      }
    );
  }));

  it('should have 3 elements in hello list', function () {
    expect(scope.hello.length).toBe(3);
  });

});
