'use strict' ;

/**
 * Tests for admin-service
 */
describe('admin-service', function() {


    var adminService;
    var rootScope;

    beforeEach(function() {
        module('helpers');
    });

    beforeEach(inject(function(_adminService_, $rootScope) {
        adminService = _adminService_;
        rootScope = $rootScope;
    }));

    it('should set admin mode to true', function() {
        expect(adminService.adminMode()).toBe(false);

        adminService.setAdminMode(true);

        expect(adminService.adminMode()).toBe(true);
    });

    it('should broadcast event when setting admin mode', function() {
        spyOn(rootScope, "$broadcast");

        adminService.setAdminMode(true);

        expect(rootScope.$broadcast).toHaveBeenCalledWith('service.adminMode.changed', true);
    });

    it('should broadcast event when setting developer mode', function() {
        spyOn(rootScope, "$broadcast");

        adminService.setDeveloperMode(true);

        expect(rootScope.$broadcast).toHaveBeenCalledWith('service.developerMode.changed', true);
    });
});


