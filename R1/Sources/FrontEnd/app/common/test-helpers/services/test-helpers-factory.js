/**
 * Created by Kiewan on 10/07/2014.
 */
'use strict';

angular.module('helpers').service('testHelperFactory', function(Part, PartPack, Product, ProductPack, RangeItem, Characteristic, Project){
    var service = {
    };

    /**
     *
     * @returns {Project}
     */
    service.createProject = function(){
        var project =  new Project();
        project.createSwitchboard('Default switchboard',1);
        return project;
    };

    /**
     *
     * @returns {Part}
     */
    var partCodeIndex = 0;
    service.createPart = function(){
        return new Part('partCode ' + partCodeIndex++, 'longName', 'resCode', 0, 0, '', '', 'ElectricalDevices');
    };

    /**
     *
     * @returns {PartPack}
     */
    service.createPartPack = function(){
        return new PartPack(service.createPart(),1);
    };

    /**
     *
     * @returns {Product}
     */
    service.createProduct = function(){
        return new Product([service.createPartPack()]);
    };

    /**
     *
     * @returns {RangeItem}
     */
    service.createRangeItem = function(){
        return new RangeItem('rangeName', 'type', 'pictureUrl', [], []);
    };

    /**
     *
     * @param {Number} partPrice
     * @param {Number} quantity
     * @returns {ProductPack}
     */
    service.createProductPack = function(partPrice, quantity){
        if (!quantity) {
            quantity = 1;
        }

        var productPack = new ProductPack(service.createProduct(), quantity, service.createRangeItem(), []);
        if (partPrice) {
            productPack.product.parts[0].part.price = partPrice;
        }

        return productPack;
    };

    /**
     *
     * @returns {Characteristic}
     */
    service.createCharacteristic = function(){
        return new Characteristic('name', 'selectedValue', ['additionalValue1', 'additionalValue2'], 'filterMechanic', 'filterElectric', false, 'unit', 'displayFilter', true, false);
    };

    service.createAdminService = function() {
        var adminService = jasmine.createSpyObj('adminService', ['adminMode', 'developerMode']);
        adminService.adminMode.andCallFake(function () {
            return false;
        });
        adminService.developerMode.andCallFake(function () {
            return false;
        });

        return adminService;
    };

    return service ;
});