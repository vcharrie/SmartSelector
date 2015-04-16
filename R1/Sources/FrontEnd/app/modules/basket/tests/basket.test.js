'use strict';

/**
 * Tests for basket
 */
describe('basket controller', function () {

    var logger,
        scope,
        ctrl;

  // Load angular module
  beforeEach(function () {
	  module('basket','ngCookies', function($provide) {
          $provide.value('adminService', {});
          $provide.value('googleAnalyticsService', {});
      });
    }
  );

  // Injection dependencies
  beforeEach(inject(function ($rootScope, $controller, $injector, _logger_) {
    // Mocks
    logger = _logger_;
    //jasmine.spyOn(logger); //TODO_WBA fin a way to do it in a clean way

    scope = $rootScope.$new();
    ctrl = $controller('basket', {
      $scope: scope
    });
  }));

  it('should have initially an empty selected products list', function () {
    expect(scope.selectedProductsList).not.toBe(null);
    expect(scope.selectedProductsList.length).toBe(0);
  });
});