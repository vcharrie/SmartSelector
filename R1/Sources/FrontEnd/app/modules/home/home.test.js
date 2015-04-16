'use strict';

/**
 * Tests for home
 */
describe('home controller', function () {

  var scope, ctrl;

  // Load angular module
  beforeEach(function () {
      module('home');
    }
  );

  // Dependencies injection
  beforeEach(inject(function ($rootScope, $controller) {
    // Mocks
    scope = $rootScope.$new();

    ctrl = $controller('home', {
        $scope: scope
      }
    );
  }));

});
