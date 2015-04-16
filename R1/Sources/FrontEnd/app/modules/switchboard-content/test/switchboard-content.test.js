'use strict';

/**
 * Tests for home
 */
describe('switchboardContent controller', function () {

  var scope, ctrl;

  // Load angular module
  beforeEach(function () {
      module('switchboardContent');
    }
  );

  // Dependencies injection
  beforeEach(inject(function ($rootScope, $controller) {
    // Mocks
    scope = $rootScope.$new();

    ctrl = $controller('switchboardContent', {
        $scope: scope
      }
    );

  }));
});
