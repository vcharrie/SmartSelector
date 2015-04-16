'use strict';

/**
 * Tests for project service
 */
describe('projectService', function () {

    var projectService;
    var Q;
    var applicationConfigurationService;
    var productPriceService;
    var rootScope;
    var httpBackend;
    var apiConstants;
    var testHelperFactory;
    var Filter;
    var appConstants;
    var productPriceServiceMock;
    var Project;

    beforeEach(function () {
        module('business', 'ngCookies', function ($provide) {
            $provide.value('adminService', {});
            $provide.value('googleAnalyticsService', {});
        });
        module('testHelper');
    });

    beforeEach(function () {
        productPriceServiceMock =  jasmine.createSpyObj('productPriceService',
            ['defaultPriceList']);

        module('tracking', function($provide) {
            $provide.value('productPriceService', productPriceServiceMock);
        });
    });

    beforeEach(inject(function (_projectService_, $q, $rootScope, $httpBackend, _applicationConfigurationService_, _productPriceService_, _apiConstants_, _testHelperFactory_, _appConstants_, _Filter_, _Project_) {
        projectService = _projectService_;
        Q = $q;
        applicationConfigurationService = _applicationConfigurationService_;
        rootScope = $rootScope;
        httpBackend = $httpBackend;
        apiConstants = _apiConstants_;
        productPriceService = _productPriceService_;
        testHelperFactory = _testHelperFactory_;
        Filter = _Filter_;
        appConstants = _appConstants_;
        Project = _Project_;
    }));

    beforeEach(function () {
        Project.current = testHelperFactory.createProject();
    });


    it('createNewProject creates a new project', function () {
        // prepare
        Project.current = null;
        productPriceServiceMock.defaultPriceList.andCallFake(function() {
            var deferred = Q.defer();
            deferred.resolve('priceList');
            return deferred.promise;
        });

        // act
        projectService.createNewProject();

        httpBackend.expectGET('/ProductConfigurationService/api/v1/range-orders').respond(200);
        httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=contextConfigurations').respond(200);

        rootScope.$apply();

        expect(Project.current).not.toBeNull();
    });

    it('loadVersion call backend and load version', function () {
        // prepare
        var getApplicationParameterPromise = Q.defer();
        spyOn(applicationConfigurationService, 'getApplicationParameter').andCallFake(function () {
            getApplicationParameterPromise.resolve({parameterObject: {version: 1}});
            return getApplicationParameterPromise.promise;
        });
        productPriceServiceMock.defaultPriceList.andCallFake(function() {
            var deferred = Q.defer();
            deferred.resolve('priceList');
            return deferred.promise;
        });

        // act
        projectService.loadVersion();

        // check
        httpBackend.expectGET('/ProductConfigurationService/api/v1/range-orders').respond(200);
        httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=contextConfigurations').respond(200);
        httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=contextConfigurations').respond(200);
        httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=version').respond(200);
        httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=globalConfiguration').respond(200);
        httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=version').respond(200);
        httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=contextConfigurations').respond(200);

        rootScope.$apply();

        expect(appConstants.version).toEqual(1);
    });


    it('load characteristics', function () {
        // prepare
        productPriceServiceMock.defaultPriceList.andCallFake(function() {
            var deferred = Q.defer();
            deferred.resolve('priceList');
            return deferred.promise;
        });
        var getApplicationParameterPromise = Q.defer();
        spyOn(applicationConfigurationService, 'getApplicationParameter').andCallFake(function () {
            getApplicationParameterPromise.resolve({
                parameterObject: {
                    contextCharacteristics: {
                        characteristics: [
                            {
                                name: 'contextCharacteristic',
                                defaultValue: 'defaultValue',
                                possibleValues: ['value1', 'value2'],
                                filterElectric: Filter.lte,
                                filterMechanic: Filter.gte,
                                unit: 'm'
                            }
                        ]
                    },
                    enclosureCharacteristics: {
                        characteristics: [
                            {
                                name: 'enclosureCharacteristic',
                                defaultValue: 'defaultValue',
                                possibleValues: ['value1', 'value2'],
                                filterElectric: Filter.lte,
                                filterMechanic: Filter.gte,
                                unit: 'm'
                            }
                        ]
                    },
                    mainDistributionCharacteristics: {
                        characteristics: [
                            {
                                name: 'distributionCharacteristics',
                                defaultValue: 'defaultValue',
                                possibleValues: ['value1', 'value2'],
                                filterElectric: Filter.lte,
                                filterMechanic: Filter.gte,
                                unit: 'm'
                            }
                        ]
                    }
                }
            });
            return getApplicationParameterPromise.promise;
        });

        //act
        projectService.loadCharacteristics();

        httpBackend.expectGET('/ProductConfigurationService/api/v1/range-orders').respond(200);
        httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=contextConfigurations').respond(200);
        httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=contextConfigurations').respond(200);
        httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=version').respond(200);
        httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=globalConfiguration').respond(200);
        httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=version').respond(200);
        httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=contextConfigurations').respond(200);
        rootScope.$apply();

        // check
        expect(Project.current.selectedSwitchboard.contextCharacteristics.length).toEqual(1);
        expect(Project.current.selectedSwitchboard.contextCharacteristics.pop().name).toEqual('contextCharacteristic');
        expect(Project.current.selectedSwitchboard.enclosureCharacteristics.length).toEqual(1);
        expect(Project.current.selectedSwitchboard.enclosureCharacteristics.pop().name).toEqual('enclosureCharacteristic');
        expect(Project.current.selectedSwitchboard.mainDistributionCharacteristics.length).toEqual(1);
        expect(Project.current.selectedSwitchboard.mainDistributionCharacteristics.pop().name).toEqual('distributionCharacteristics');
    });

//     it ('save and load project correctly', function(){
//        //prepare
//         var createNewProjectPromise = Q.defer();
//         spyOn(projectService,'createNewProject').andCallFake(function() {
//             createNewProjectPromise.resolve();
//             return createNewProjectPromise.promise;
//         });
//
//         var getPartPricesPromise = Q.defer();
//         spyOn(productPriceService,'getPartsPrice').andCallFake(function(){
//             getPartPricesPromise.resolve([]);
//             return getPartPricesPromise.promise;
//         });
//
//         Project.current.name = 'toto' ;
//         Project.current.clientReference = 'client reference';
//         Project.current.projectNote = 'project note';
//
//         // act
//         var savedProject1 = projectService.saveProject();
//         Project.current.name = 'titi' ;
//         Project.current.clientReference = '';
//         Project.current.projectNote = '';
//
//         projectService.loadProject(savedProject1);
//
//         httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=version').respond(200);
//         httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=contextConfigurations').respond(200);
//         httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=globalConfiguration').respond(200);
//         httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=version').respond(200);
//         httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=contextConfigurations').respond(200);
//         httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=version').respond(200);
//         httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=contextConfigurations').respond(200);
//         httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=globalConfiguration').respond(200);
//         httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=version').respond(200);
//         httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=contextConfigurations').respond(200);
//         httpBackend.expectPOST(apiConstants.partsInfo).respond(200);
//         rootScope.$apply();
//
//         var savedProject2 = projectService.saveProject();
//
//         //check
//         expect(Project.current.name).toEqual('toto'); // check that the name has been loaded
//         expect(Project.current.clientReference).toEqual('client reference'); // check that the client reference has been loaded
//         expect(Project.current.projectNote).toEqual('project note'); // check that the project note has been loaded
//         expect(savedProject1).toEqual(savedProject2); // check that the json containing serialized project is the same after loading project
//     });

//     it('check that price are updated after loading a project', function(){
//         //prepare
//         var productPack = testHelperFactory.createProductPack();
//
//         var createNewProjectPromise = Q.defer();
//         spyOn(projectService,'createNewProject').andCallFake(function() {
//             createNewProjectPromise.resolve();
//             return createNewProjectPromise.promise;
//         });
//
//         var getPartPricesPromise = Q.defer();
//         spyOn(productPriceService,'getPartsPrice').andCallFake(function(){
//             getPartPricesPromise.resolve([{partCode : productPack.product.parts[0].part.partCode, price : 10}]);
//             return getPartPricesPromise.promise;
//         });
//
//         Project.current.selectedSwitchboard.getBaskets()[0].list = [productPack] ;
//
//         //act
//         projectService.loadProject(projectService.saveProject());
//
//         httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=version').respond(200);
//         httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=contextConfigurations').respond(200);
//         httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=globalConfiguration').respond(200);
//         httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=version').respond(200);
//         httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=contextConfigurations').respond(200);
//         httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=version').respond(200);
//         httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=contextConfigurations').respond(200);
//         httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=globalConfiguration').respond(200);
//         httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=version').respond(200);
//         httpBackend.expectGET(apiConstants.applicationConfiguration + '?parameterId=contextConfigurations').respond(200);
//         httpBackend.expectPOST(apiConstants.partsInfo).respond(200);
//         rootScope.$apply();
//
//         // check
//         expect(Project.current.selectedSwitchboard.getBaskets()[0].list[0].product.parts[0].part.price).toEqual(10);
//     });

    it('hasElectricalDevices', function () {
        expect(projectService.hasElectricalDevices()).toBe(false);
        Project.current.selectedSwitchboard.electricBasket.list = [testHelperFactory.createProductPack()];
        expect(projectService.hasElectricalDevices()).toBe(true);
    });

    it('hasElectricalDeviceList', function () {
        expect(projectService.hasElectricalDeviceList()).toBe(true);
        Project.current.selectedSwitchboard.electricBasket.list = null;
        expect(projectService.hasElectricalDeviceList()).toBe(false);
        Project.current.selectedSwitchboard.electricBasket = null;
        expect(projectService.hasElectricalDeviceList()).toBe(false);
        Project.current = null;
        expect(projectService.hasElectricalDeviceList()).toBe(false);
    });

    it('hasMechanicalDevices', function () {
        expect(projectService.hasMechanicalDevices()).toBe(false);
        Project.current.selectedSwitchboard.mechanicBasket.list = [testHelperFactory.createProductPack()];
        expect(projectService.hasMechanicalDevices()).toBe(true);
    });

    it('hasMechanicalDeviceList', function () {
        expect(projectService.hasMechanicalDeviceList()).toBe(true);
        Project.current.selectedSwitchboard.mechanicBasket.list = null;
        expect(projectService.hasMechanicalDeviceList()).toBe(false);
        Project.current.selectedSwitchboard.mechanicBasket = null;
        expect(projectService.hasMechanicalDeviceList()).toBe(false);
        Project.current = null;
        expect(projectService.hasMechanicalDeviceList()).toBe(false);
    });

    it('hasDistributionDevices', function () {
        expect(projectService.hasDistributionDevices()).toBe(false);
        Project.current.selectedSwitchboard.distributionBasket.list = [testHelperFactory.createProductPack()];
        expect(projectService.hasDistributionDevices()).toBe(true);
    });

    it('hasDistributionDeviceList', function () {
        expect(projectService.hasDistributionDeviceList()).toBe(true);
        Project.current.selectedSwitchboard.distributionBasket.list = null;
        expect(projectService.hasDistributionDeviceList()).toBe(false);
        Project.current.selectedSwitchboard.distributionBasket = null;
        expect(projectService.hasDistributionDeviceList()).toBe(false);
        Project.current = null;
        expect(projectService.hasDistributionDeviceList()).toBe(false);
    });
});
