'use strict' ;

/**
 * Tests for network service
 */
 describe('networkService', function() {

     var networkService;
     var projectService;
     var productConfigurationTrackingService;
     var Product;
     var Device;
     var testHelperFactory;
     var Project;

    beforeEach(function () {
        productConfigurationTrackingService =  jasmine.createSpyObj('productConfigurationTrackingService',
            ['clearSelectedCharacteristics',
                'characSelected',
                'characUnselected',
                'productAdded']);

        productConfigurationTrackingService.productAdded.andCallFake(function(product) {return true;});
        module('business','ngCookies', function($provide) {
            $provide.value('adminService', {});
            $provide.value('googleAnalyticsService', {});
            $provide.value('productConfigurationTrackingService', productConfigurationTrackingService);
        });
    });

    beforeEach(inject(function(_networkService_,_projectService_, _Product_, _Device_, _testHelperFactory_, _Project_){
        networkService = _networkService_ ;
        projectService = _projectService_ ;
        Product = _Product_;
        Device = _Device_;
        testHelperFactory = _testHelperFactory_;
        Project = _Project_;
    }));

     beforeEach(function() {
         Project.current = testHelperFactory.createProject();
     });

     it('startNetwork should set one incomer device in the network', function() {
         var productPack = testHelperFactory.createProductPack(1,1);

         var incomerDevice = networkService.startNetwork(productPack, networkService.electricalDeviceType);

         expect(Project.current.selectedSwitchboard.network.incomerDevices.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0]).toEqual(incomerDevice);

         // call to networkService.startNetwork creates a clone of the product pack
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].product).not.toEqual(productPack.product);
         Project.current.selectedSwitchboard.network.incomerDevices[0].product.id = productPack.product.id;
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].product).toEqual(productPack.product);
     });

     it('addDownstreamDevice should add a distribution before one downstream device when there was no distribution downstream', function() {
         var productPack1 = testHelperFactory.createProductPack(1,1);
         var productPack2 = testHelperFactory.createProductPack(2,2);

         var incomerDevice = networkService.startNetwork(productPack1, networkService.electricalDeviceType);
         var downstreamDevice1 = networkService.addDownstreamDevice(incomerDevice, productPack2, networkService.electricalDeviceType)[1];

         expect(Project.current.selectedSwitchboard.network.incomerDevices.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0]).toEqual(incomerDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].product).not.toEqual(productPack1.product);
         Project.current.selectedSwitchboard.network.incomerDevices[0].product.id = productPack1.product.id;
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].product).toEqual(productPack1.product);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].product.parts[0].part.partCode).toEqual('');
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].type).toEqual(networkService.distributionType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0]).toEqual(downstreamDevice1);

         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].product).not.toEqual(productPack2.product);
         Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].product.id = productPack2.product.id;
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].product).toEqual(productPack2.product);
     });

     it('addDownstreamDevice should add one downstream device among other downstream devices', function() {
         var productPack1 = testHelperFactory.createProductPack(1,1);
         var productPack2 = testHelperFactory.createProductPack(2,2);
         var productPack3 = testHelperFactory.createProductPack(3,3);

         var incomerDevice = networkService.startNetwork(productPack1, networkService.electricalDeviceType);
         var downstreamDevice1 = networkService.addDownstreamDevice(incomerDevice, productPack2, networkService.electricalDeviceType)[1];
         var distributionDevice = incomerDevice.children[0];
         var downstreamDevice2 = networkService.addDownstreamDevice(distributionDevice, productPack3, networkService.electricalDeviceType)[0];

         expect(Project.current.selectedSwitchboard.network.incomerDevices.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0]).toEqual(incomerDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].product).not.toEqual(productPack1.product);
         Project.current.selectedSwitchboard.network.incomerDevices[0].product.id = productPack1.product.id;
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].product).toEqual(productPack1.product);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0]).toEqual(distributionDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].product.parts[0].part.partCode).toEqual('');
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].type).toEqual(networkService.distributionType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children.length).toEqual(2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0]).toEqual(downstreamDevice1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].product).not.toEqual(productPack2.product);
         Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].product.id = productPack2.product.id;
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].product).toEqual(productPack2.product);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[1]).toEqual(downstreamDevice2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[1].product).not.toEqual(productPack3.product);
         Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[1].product.id = productPack3.product.id;
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[1].product).toEqual(productPack3.product);
     });

     it('addParallelDevice should add one parallel device correctly connected to the parent', function() {
         var productPack1 = testHelperFactory.createProductPack(1,1);
         var productPack2 = testHelperFactory.createProductPack(2,2);
         var productPack3 = testHelperFactory.createProductPack(3,3);

         var incomerDevice = networkService.startNetwork(productPack1, networkService.electricalDeviceType);
         var downstreamDevice1 = networkService.addDownstreamDevice(incomerDevice, productPack2, networkService.electricalDeviceType)[1];
         var distributionDevice = incomerDevice.children[0];
         var downstreamDevice2 = networkService.addParallelDevice(downstreamDevice1, productPack3, networkService.electricalDeviceType);

         expect(Project.current.selectedSwitchboard.network.incomerDevices.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0]).toEqual(incomerDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].product).not.toEqual(productPack1.product);
         Project.current.selectedSwitchboard.network.incomerDevices[0].product.id = productPack1.product.id;
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].product).toEqual(productPack1.product);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0]).toEqual(distributionDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].product.parts[0].part.partCode).toEqual('');
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].type).toEqual(networkService.distributionType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children.length).toEqual(2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0]).toEqual(downstreamDevice1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].product).not.toEqual(productPack2.product);
         Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].product.id = productPack2.product.id;
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].product).toEqual(productPack2.product);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[1]).toEqual(downstreamDevice2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[1].product).not.toEqual(productPack3.product);
         Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[1].product.id = productPack3.product.id;
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[1].product).toEqual(productPack3.product);
     });

     it('addParallelDevice should add a new incomer device to the network', function() {
         var productPack1 = testHelperFactory.createProductPack(1,1);
         var productPack2 = testHelperFactory.createProductPack(2,2);
         var productPack3 = testHelperFactory.createProductPack(3,3);

         var incomerDevice = networkService.startNetwork(productPack1, networkService.electricalDeviceType);
         var incomerDevice2 = networkService.addParallelDevice(incomerDevice, productPack3, networkService.electricalDeviceType);
         var downstreamDevice1 = networkService.addDownstreamDevice(incomerDevice, productPack2, networkService.electricalDeviceType)[1];
         var distributionDevice = incomerDevice.children[0];

         expect(Project.current.selectedSwitchboard.network.incomerDevices.length).toEqual(2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0]).toEqual(incomerDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].product).not.toEqual(productPack1.product);
         Project.current.selectedSwitchboard.network.incomerDevices[0].product.id = productPack1.product.id;
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].product).toEqual(productPack1.product);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0]).toEqual(distributionDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].product.parts[0].part.partCode).toEqual('');
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].type).toEqual(networkService.distributionType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0]).toEqual(downstreamDevice1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].product).not.toEqual(productPack2.product);
         Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].product.id = productPack2.product.id;
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].product).toEqual(productPack2.product);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1]).toEqual(incomerDevice2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1].product).not.toEqual(productPack3.product);
         Project.current.selectedSwitchboard.network.incomerDevices[1].product.id = productPack3.product.id;
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1].product).toEqual(productPack3.product);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1].children.length).toEqual(0);
     });

     it('deleteDevice should delete a downstream device with all its children', function() {
         var productPack1 = testHelperFactory.createProductPack(1,1);
         var productPack2 = testHelperFactory.createProductPack(2,2);
         var productPack3 = testHelperFactory.createProductPack(3,3);
         var productPack4 = testHelperFactory.createProductPack(4,4);

         var incomerDevice = networkService.startNetwork(productPack1, networkService.electricalDeviceType);
         var downstreamDevice1 = networkService.addDownstreamDevice(incomerDevice, productPack2, networkService.electricalDeviceType)[1];
         var distributionDevice = incomerDevice.children[0];
         var downstreamDevice2 = networkService.addDownstreamDevice(distributionDevice, productPack3, networkService.electricalDeviceType)[0];

         var downstreamDownstreamDevice1 = networkService.addDownstreamDevice(downstreamDevice1, productPack4, networkService.electricalDeviceType)[1];
         var distributionDevice2 = downstreamDevice1.children[0];

         expect(Project.current.selectedSwitchboard.network.incomerDevices.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0]).toEqual(incomerDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].product).not.toEqual(productPack1.product);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0]).toEqual(distributionDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].product.parts[0].part.partCode).toEqual('');
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].type).toEqual(networkService.distributionType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children.length).toEqual(2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0]).toEqual(downstreamDevice1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].product).not.toEqual(productPack2.product);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[1]).toEqual(downstreamDevice2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[1].product).not.toEqual(productPack3.product);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0]).toEqual(distributionDevice2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0].product.parts[0].part.partCode).toEqual('');
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0].type).toEqual(networkService.distributionType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0].children.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0].children[0]).toEqual(downstreamDownstreamDevice1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0].children[0].product).not.toEqual(productPack4.product);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0].children[0].children.length).toEqual(0);

         networkService.deleteDevice(downstreamDevice1);

         expect(Project.current.selectedSwitchboard.network.incomerDevices.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0]).toEqual(incomerDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].product).not.toEqual(productPack1.product);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0]).toEqual(distributionDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].product.parts[0].part.partCode).toEqual('');
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].type).toEqual(networkService.distributionType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0]).toEqual(downstreamDevice2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].product).not.toEqual(productPack3.product);
     });

     it('deleteDevice should delete old distribution if it was the last child', function() {
         var productPack1 = testHelperFactory.createProductPack(1,1);
         var productPack2 = testHelperFactory.createProductPack(2,2);
         var productPack3 = testHelperFactory.createProductPack(3,3);
         var productPack4 = testHelperFactory.createProductPack(4,4);

         var incomerDevice = networkService.startNetwork(productPack1, networkService.electricalDeviceType);
         var downstreamDevice1 = networkService.addDownstreamDevice(incomerDevice, productPack2, networkService.electricalDeviceType)[1];
         var distributionDevice = incomerDevice.children[0];
         var downstreamDevice2 = networkService.addDownstreamDevice(distributionDevice, productPack3, networkService.electricalDeviceType)[0];

         var downstreamDownstreamDevice1 = networkService.addDownstreamDevice(downstreamDevice1, productPack4, networkService.electricalDeviceType)[1];
         var distributionDevice2 = downstreamDevice1.children[0];

         expect(Project.current.selectedSwitchboard.network.incomerDevices.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0]).toEqual(incomerDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].product).not.toEqual(productPack1.product);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0]).toEqual(distributionDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].product.parts[0].part.partCode).toEqual('');
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].type).toEqual(networkService.distributionType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children.length).toEqual(2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0]).toEqual(downstreamDevice1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].product).not.toEqual(productPack2.product);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[1]).toEqual(downstreamDevice2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[1].product).not.toEqual(productPack3.product);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0]).toEqual(distributionDevice2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0].product.parts[0].part.partCode).toEqual('');
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0].type).toEqual(networkService.distributionType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0].children.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0].children[0]).toEqual(downstreamDownstreamDevice1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0].children[0].product).not.toEqual(productPack4.product);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0].children[0].children.length).toEqual(0);

         networkService.deleteDevice(downstreamDevice1);
         networkService.deleteDevice(downstreamDevice2);

         expect(Project.current.selectedSwitchboard.network.incomerDevices.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0]).toEqual(incomerDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].product).not.toEqual(productPack1.product);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children.length).toEqual(0);
     });

     it('deleteDevice should delete an incomer device with all its children', function() {
         var productPack1 = testHelperFactory.createProductPack(1,1);
         var productPack2 = testHelperFactory.createProductPack(2,2);
         var productPack3 = testHelperFactory.createProductPack(3,3);
         var productPack4 = testHelperFactory.createProductPack(4,4);

         var incomerDevice = networkService.startNetwork(productPack1, networkService.electricalDeviceType);
         var downstreamDevice1 = networkService.addDownstreamDevice(incomerDevice, productPack2, networkService.electricalDeviceType)[1];
         var distributionDevice = incomerDevice.children[0];
         var downstreamDevice2 = networkService.addDownstreamDevice(distributionDevice, productPack3, networkService.electricalDeviceType)[0];

         var downstreamDownstreamDevice1 = networkService.addDownstreamDevice(downstreamDevice1, productPack4, networkService.electricalDeviceType)[1];
         var distributionDevice2 = downstreamDevice1.children[0];

         expect(Project.current.selectedSwitchboard.network.incomerDevices.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0]).toEqual(incomerDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].product).not.toEqual(productPack1.product);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0]).toEqual(distributionDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].product.parts[0].part.partCode).toEqual('');
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].type).toEqual(networkService.distributionType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children.length).toEqual(2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0]).toEqual(downstreamDevice1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].product).not.toEqual(productPack2.product);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[1]).toEqual(downstreamDevice2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[1].product).not.toEqual(productPack3.product);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0]).toEqual(distributionDevice2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0].product.parts[0].part.partCode).toEqual('');
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0].type).toEqual(networkService.distributionType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0].children.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0].children[0]).toEqual(downstreamDownstreamDevice1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0].children[0].product).not.toEqual(productPack4.product);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0].children[0].children.length).toEqual(0);

         networkService.deleteDevice(incomerDevice);

         expect(Project.current.selectedSwitchboard.network.incomerDevices.length).toEqual(0);
     });

     it('moveDevice should move device from one parent to an existing distribution parent', function() {
         var productPack1 = testHelperFactory.createProductPack(1,1);
         var productPack2 = testHelperFactory.createProductPack(2,2);
         var productPack3 = testHelperFactory.createProductPack(3,3);
         var productPack4 = testHelperFactory.createProductPack(4,4);

         var incomerDevice = networkService.startNetwork(productPack4, networkService.electricalDeviceType);
         var incomerDevice2 = networkService.addParallelDevice(incomerDevice, productPack1, networkService.electricalDeviceType);
         var downstreamDevice1 = networkService.addDownstreamDevice(incomerDevice2, productPack2, networkService.electricalDeviceType)[1];
         var distributionDevice = incomerDevice2.children[0];
         var downstreamDevice2 = networkService.addDownstreamDevice(distributionDevice, productPack3, networkService.electricalDeviceType)[0];
         networkService.moveDevice(incomerDevice, distributionDevice, 2, null);

         expect(Project.current.selectedSwitchboard.network.incomerDevices.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0]).toEqual(incomerDevice2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].product).not.toEqual(productPack1.product);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0]).toEqual(distributionDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].product.parts[0].part.partCode).toEqual('');
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].type).toEqual(networkService.distributionType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children.length).toEqual(3);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0]).toEqual(downstreamDevice1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].product).not.toEqual(productPack2.product);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[1]).toEqual(downstreamDevice2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[1].product).not.toEqual(productPack3.product);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[2]).toEqual(incomerDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[2].product).not.toEqual(productPack4.product);
     });

     it('moveDevice should move device from one parent to another creating a distribution', function() {
         var productPack1 = testHelperFactory.createProductPack(1,1);
         var productPack2 = testHelperFactory.createProductPack(2,2);

         var incomerDevice = networkService.startNetwork(productPack1, networkService.electricalDeviceType);
         var incomerDevice2 = networkService.addParallelDevice(incomerDevice, productPack2, networkService.electricalDeviceType);

         networkService.moveDevice(incomerDevice2, incomerDevice, 0, null);

         expect(Project.current.selectedSwitchboard.network.incomerDevices.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0]).toEqual(incomerDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].type).toEqual(networkService.distributionType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0]).toEqual(incomerDevice2);

     });

     it('moveDevice should move device to be a new incomer device of the network', function() {
         var productPack1 = testHelperFactory.createProductPack(1,1);
         var productPack2 = testHelperFactory.createProductPack(2,2);
         var productPack3 = testHelperFactory.createProductPack(3,3);

         var incomerDevice = networkService.startNetwork(productPack1, networkService.electricalDeviceType);
         var downstreamDevice1 = networkService.addDownstreamDevice(incomerDevice, productPack2, networkService.electricalDeviceType)[1];
         var distributionDevice = incomerDevice.children[0];
         var downstreamDevice2 = networkService.addDownstreamDevice(distributionDevice, productPack3, networkService.electricalDeviceType)[0];

         networkService.moveDevice(downstreamDevice2, null, 0, null);

         expect(Project.current.selectedSwitchboard.network.incomerDevices.length).toEqual(2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0]).toEqual(downstreamDevice2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].type).toEqual(networkService.electricalDeviceType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1]).toEqual(incomerDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1].type).toEqual(networkService.electricalDeviceType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1].children.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1].children[0].type).toEqual(networkService.distributionType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1].children[0].children.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1].children[0].children[0]).toEqual(downstreamDevice1);
     });

     it('moveDevice should delete old distribution if it was the last child', function() {
         var productPack1 = testHelperFactory.createProductPack(1,1);
         var productPack2 = testHelperFactory.createProductPack(2,2);

         var incomerDevice = networkService.startNetwork(productPack1, networkService.electricalDeviceType);
         var downstreamDevice1 = networkService.addDownstreamDevice(incomerDevice, productPack2, networkService.electricalDeviceType)[1];

         networkService.moveDevice(downstreamDevice1, null, 1, null);

         expect(Project.current.selectedSwitchboard.network.incomerDevices.length).toEqual(2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0]).toEqual(incomerDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].type).toEqual(networkService.electricalDeviceType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1]).toEqual(downstreamDevice1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1].type).toEqual(networkService.electricalDeviceType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1].children.length).toEqual(0);
     });

     it('moveDevice should move device from one parent with a downstream distribution to another parent creating a new distribution', function() {
         var productPack1 = testHelperFactory.createProductPack(1,1);
         var productPack2 = testHelperFactory.createProductPack(2,2);
         var productPack3 = testHelperFactory.createProductPack(3,3);
         var productPack4 = testHelperFactory.createProductPack(4,4);

         var incomerDevice = networkService.startNetwork(productPack1, networkService.electricalDeviceType);
         var downstreamDevice1 = networkService.addDownstreamDevice(incomerDevice, productPack2, networkService.electricalDeviceType)[1];
         var distributionDevice1 = incomerDevice.children[0];
         var downstreamDevice2 = networkService.addDownstreamDevice(distributionDevice1, productPack3, networkService.electricalDeviceType)[0];
         var downstreamDevice3 = networkService.addDownstreamDevice(downstreamDevice1, productPack4, networkService.electricalDeviceType)[1];
         var distributionDevice2 = downstreamDevice1.children[0];

         networkService.moveDevice(downstreamDevice2, distributionDevice2, 1, null);

         expect(Project.current.selectedSwitchboard.network.incomerDevices.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0]).toEqual(incomerDevice);

         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].type).toEqual(networkService.distributionType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0]).toEqual(distributionDevice1);

         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0]).toEqual(downstreamDevice1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].type).toEqual(networkService.electricalDeviceType);

         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0].type).toEqual(networkService.distributionType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0]).toEqual(distributionDevice2);

         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0].children.length).toEqual(2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0].children[0].type).toEqual(networkService.electricalDeviceType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0].children[0]).toEqual(downstreamDevice3);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0].children[1].type).toEqual(networkService.electricalDeviceType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0].children[1]).toEqual(downstreamDevice2);
     });

     it('moveDevice should move device from one parent to another parent with distribution downstream substituting old parenthood', function() {
         var productPack1 = testHelperFactory.createProductPack(1,1);
         var productPack2 = testHelperFactory.createProductPack(2,2);
         var productPack3 = testHelperFactory.createProductPack(3,3);

         var incomerDevice = networkService.startNetwork(productPack1, networkService.electricalDeviceType);
         var downstreamDevice1 = networkService.addDownstreamDevice(incomerDevice, productPack2, networkService.electricalDeviceType)[1];
         var distributionDevice = incomerDevice.children[0];
         var downstreamDevice2 = networkService.addDownstreamDevice(distributionDevice, productPack3, networkService.electricalDeviceType)[0];

         networkService.moveDevice(downstreamDevice1, null, 1, distributionDevice);

         expect(Project.current.selectedSwitchboard.network.incomerDevices.length).toEqual(2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].type).toEqual(networkService.electricalDeviceType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0]).toEqual(incomerDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children.length).toEqual(0);

         expect(Project.current.selectedSwitchboard.network.incomerDevices[1].type).toEqual(networkService.electricalDeviceType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1]).toEqual(downstreamDevice1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1].children.length).toEqual(1);

         expect(Project.current.selectedSwitchboard.network.incomerDevices[1].children[0].type).toEqual(networkService.distributionType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1].children[0].children.length).toEqual(1);

         expect(Project.current.selectedSwitchboard.network.incomerDevices[1].children[0].children[0].type).toEqual(networkService.electricalDeviceType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1].children[0].children[0]).toEqual(downstreamDevice2);
     });

     it('moveDevice should move device and its children from one parent to another', function() {
         var productPack1 = testHelperFactory.createProductPack(1,1);
         var productPack2 = testHelperFactory.createProductPack(2,2);
         var productPack3 = testHelperFactory.createProductPack(3,3);
         var productPack4 = testHelperFactory.createProductPack(4,4);
         var productPack5 = testHelperFactory.createProductPack(5,5);

         var incomerDevice = networkService.startNetwork(productPack1, networkService.electricalDeviceType);
         var downstreamDevice1 = networkService.addDownstreamDevice(incomerDevice, productPack2, networkService.electricalDeviceType)[1];
         var distributionDevice1 = incomerDevice.children[0];
         var downstreamDevice2 = networkService.addDownstreamDevice(downstreamDevice1, productPack3, networkService.electricalDeviceType)[1];
         var distributionDevice2 = downstreamDevice1.children[0];
         var downstreamDevice3 = networkService.addDownstreamDevice(distributionDevice1, productPack4, networkService.electricalDeviceType)[0];
         var downstreamDevice4 = networkService.addDownstreamDevice(downstreamDevice3, productPack5, networkService.electricalDeviceType)[1];
         var distributionDevice3 = downstreamDevice3.children[0];

         networkService.moveDevice(downstreamDevice3, distributionDevice1, 0, null);

         expect(Project.current.selectedSwitchboard.network.incomerDevices.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].type).toEqual(networkService.electricalDeviceType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0]).toEqual(incomerDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children.length).toEqual(1);

         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].type).toEqual(networkService.distributionType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0]).toEqual(distributionDevice1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children.length).toEqual(2);

         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].type).toEqual(networkService.electricalDeviceType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0]).toEqual(downstreamDevice3);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children.length).toEqual(1);

         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0].type).toEqual(networkService.distributionType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0]).toEqual(distributionDevice3);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0].children.length).toEqual(1);

         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0].children[0].type).toEqual(networkService.electricalDeviceType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0].children[0]).toEqual(downstreamDevice4);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].children[0].children[0].children.length).toEqual(0);

         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[1].type).toEqual(networkService.electricalDeviceType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[1]).toEqual(downstreamDevice1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[1].children.length).toEqual(1);

         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[1].children[0].type).toEqual(networkService.distributionType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[1].children[0]).toEqual(distributionDevice2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[1].children[0].children.length).toEqual(1);

         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[1].children[0].children[0].type).toEqual(networkService.electricalDeviceType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[1].children[0].children[0]).toEqual(downstreamDevice2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[1].children[0].children[0].children.length).toEqual(0);

     });

     it('moveDevice should move device from one parent to another incomerdevice parent. Main distribution is already wired and has at least two children', function() {
         var productPack1 = testHelperFactory.createProductPack(1,1);
         var productPack2 = testHelperFactory.createProductPack(2,2);
         var productPack3 = testHelperFactory.createProductPack(3,3);
         var productPack4 = testHelperFactory.createProductPack(4,4);

         var incomerDevice = networkService.startNetwork(productPack1, networkService.electricalDeviceType);
         var incomerDevice2 = networkService.addParallelDevice(incomerDevice, productPack2, networkService.electricalDeviceType);
         var downstreamDevice1 = networkService.addDownstreamDevice(incomerDevice2, productPack3, networkService.electricalDeviceType)[1];
         var distributionDevice = incomerDevice2.children[0];
         var downstreamDevice2 = networkService.addDownstreamDevice(distributionDevice, productPack4, networkService.electricalDeviceType)[0];

         networkService.moveDevice(downstreamDevice2, incomerDevice, 0, null);

         expect(Project.current.selectedSwitchboard.network.incomerDevices.length).toEqual(2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].type).toEqual(networkService.electricalDeviceType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0]).toEqual(incomerDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children.length).toEqual(0);

         expect(Project.current.selectedSwitchboard.network.incomerDevices[1].type).toEqual(networkService.electricalDeviceType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1]).toEqual(incomerDevice2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1].children.length).toEqual(1);

         expect(Project.current.selectedSwitchboard.network.incomerDevices[1].children[0].type).toEqual(networkService.distributionType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1].children[0].children.length).toEqual(2);

         expect(Project.current.selectedSwitchboard.network.incomerDevices[1].children[0].children[0].type).toEqual(networkService.electricalDeviceType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1].children[0].children[0]).toEqual(downstreamDevice1);

         expect(Project.current.selectedSwitchboard.network.incomerDevices[1].children[0].children[1].type).toEqual(networkService.electricalDeviceType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1].children[0].children[1]).toEqual(downstreamDevice2);
     });

     it('moveDevice should move device from the main distribution to another incomerdevice parent. New main distribution should be created', function() {
         var productPack1 = testHelperFactory.createProductPack(1,1);
         var productPack2 = testHelperFactory.createProductPack(2,2);
         var productPack3 = testHelperFactory.createProductPack(3,3);

         var incomerDevice = networkService.startNetwork(productPack1, networkService.electricalDeviceType);
         var incomerDevice2 = networkService.addParallelDevice(incomerDevice, productPack2, networkService.electricalDeviceType);
         var downstreamDevice1 = networkService.addDownstreamDevice(incomerDevice2, productPack3, networkService.electricalDeviceType)[1];

         networkService.moveDevice(downstreamDevice1, incomerDevice, 0, null);

         expect(Project.current.selectedSwitchboard.network.incomerDevices.length).toEqual(2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].type).toEqual(networkService.electricalDeviceType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0]).toEqual(incomerDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children.length).toEqual(1);

         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].type).toEqual(networkService.distributionType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children.length).toEqual(1);

         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0].type).toEqual(networkService.electricalDeviceType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0]).toEqual(downstreamDevice1);

         expect(Project.current.selectedSwitchboard.network.incomerDevices[1].type).toEqual(networkService.electricalDeviceType);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1]).toEqual(incomerDevice2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1].children.length).toEqual(0);

     });

     it('modifyDistribution should add a distribution', function() {
         // prepare
         var productPack1 = testHelperFactory.createProductPack(1,1);
         var productPack2 = testHelperFactory.createProductPack(2,2);
         var productPack3 = testHelperFactory.createProductPack(3,3);

         var incomerDevice = networkService.startNetwork(productPack1, networkService.electricalDeviceType);
         networkService.addDownstreamDevice(incomerDevice, productPack2, networkService.electricalDeviceType);

         // act
         var result = networkService.modifyDistribution(incomerDevice.children[0], productPack3);

         // check
         expect(result).not.toBe(null);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].product).not.toEqual(productPack3.product);
         Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].product.id = productPack3.product.id;
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].product).toEqual(productPack3.product);
     });

     it('modifyDistribution should change the previous distribution to another one that is different', function() {
         // prepare
         var productPack1 = testHelperFactory.createProductPack(1,1);
         var productPack2 = testHelperFactory.createProductPack(2,2);
         var productPack3 = testHelperFactory.createProductPack(3,3);
         var productPack4 = testHelperFactory.createProductPack(4,4);

         var incomerDevice = networkService.startNetwork(productPack1, networkService.electricalDeviceType);
         networkService.addDownstreamDevice(incomerDevice, productPack2, networkService.electricalDeviceType);
         networkService.modifyDistribution(incomerDevice.children[0], productPack3);

         // act
         var result = networkService.modifyDistribution(incomerDevice.children[0], productPack4);

         // check
         expect(result).not.toBe(null);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].product).toEqual(productPack4.product);
     });

     it('modifyDistribution should decrease the previous distribution', function() {
         // prepare
         var productPack1 = testHelperFactory.createProductPack(1,1);
         var productPack2 = testHelperFactory.createProductPack(2,2);
         var productPack3 = testHelperFactory.createProductPack(3,3);
         var productPack4 = productPack3;
         productPack4._quantity = 2;

         var incomerDevice = networkService.startNetwork(productPack1, networkService.electricalDeviceType);
         networkService.addDownstreamDevice(incomerDevice, productPack2, networkService.electricalDeviceType);
         networkService.modifyDistribution(incomerDevice.children[0], productPack3);

         // act
         var result = networkService.modifyDistribution(productPack3, productPack4);

         // check
         expect(result).not.toBe(null);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].product).not.toEqual(productPack4.product);
         Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].product.id = productPack4.product.id;
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].product).toEqual(productPack4.product);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].product._quantity).toEqual(productPack4.product._quantity);
     });

     it('modifyDistribution should delete the previous distribution', function() {
         // prepare
         var productPack1 = testHelperFactory.createProductPack(1,1);
         var productPack2 = testHelperFactory.createProductPack(2,2);
         var productPack3 = testHelperFactory.createProductPack(3,3);

         var incomerDevice = networkService.startNetwork(productPack1, networkService.electricalDeviceType);
         networkService.addDownstreamDevice(incomerDevice, productPack2, networkService.electricalDeviceType);
         networkService.modifyDistribution(incomerDevice.children[0], productPack3);

         // act
         var result = networkService.modifyDistribution(incomerDevice.children[0], null);

         // check
         expect(result).not.toBe(null);
         //expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].product._quantity).toEqual(productPack4.product._quantity);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].product._quantity).toBe(undefined);
     });

     it('clearNetwork should clear the network', function(){
         // prepare
         var productPack1 = testHelperFactory.createProductPack(1,1);
         var productPack2 = testHelperFactory.createProductPack(2,2);
         var productPack3 = testHelperFactory.createProductPack(3,3);

         var incomerDevice = networkService.startNetwork(productPack1, networkService.electricalDeviceType);
         networkService.addDownstreamDevice(incomerDevice, productPack2, networkService.electricalDeviceType);
         networkService.modifyDistribution(incomerDevice.children[0], productPack3);

         // act
         networkService.clearNetwork();

         // check
         expect(Project.current.selectedSwitchboard.network.incomerDevices.length).toEqual(0);
         expect(Project.current.selectedSwitchboard.electricBasket.list.length).toEqual(0);
         expect(Project.current.selectedSwitchboard.mechanicBasket.list.length).toEqual(0);
         expect(Project.current.selectedSwitchboard.distributionBasket.list.length).toEqual(0);
         expect(Project.current.selectedSwitchboard.additionalProductsBasket.list.length).toEqual(0);
     });

     it('modifyDevice should replace an old device by a new configuration of the same type', function(){
         // prepare
         var productPack1 = testHelperFactory.createProductPack(1,1);
         var productPack2 = testHelperFactory.createProductPack(2,2);
         var productPack3 = testHelperFactory.createProductPack(3,3);

         var incomerDevice = networkService.startNetwork(productPack1, networkService.electricalDeviceType);
         var downstreamDevice1 = networkService.addDownstreamDevice(incomerDevice, productPack2, networkService.electricalDeviceType)[1];

         // act
         var newDevice = networkService.modifyDevice(downstreamDevice1, productPack3);

         // check
         expect(newDevice.product).toEqual(productPack3._product);
     });

     it('productHaveChildren should find if products have children or not', function() {
         // prepare
         var productPack1 = testHelperFactory.createProductPack(1,1);
         var productPack2 = testHelperFactory.createProductPack(2,2);
         var productPack3 = testHelperFactory.createProductPack(3,3);
         var productPack4 = testHelperFactory.createProductPack(4,4);
         var productPack5 = testHelperFactory.createProductPack(5,5);

         // act
         var incomerDevice = networkService.startNetwork(productPack1, networkService.electricalDeviceType);
         var downstreamDevice1 = networkService.addDownstreamDevice(incomerDevice, productPack2, networkService.electricalDeviceType)[1];
         var distributionDevice = incomerDevice.children[0];
         var downstreamDevice2 = networkService.addDownstreamDevice(distributionDevice, productPack3, networkService.electricalDeviceType)[0];
         var downstreamDevice3 = networkService.addDownstreamDevice(distributionDevice, productPack4, networkService.electricalDeviceType)[0];
         var subDownstreamDevice = networkService.addDownstreamDevice(downstreamDevice2, productPack5, networkService.electricalDeviceType)[1];

         var childrenCount1 = networkService.productHaveChildren(incomerDevice.product);
         var childrenCount2 = networkService.productHaveChildren(distributionDevice.product);
         var childrenCount3 = networkService.productHaveChildren(downstreamDevice1.product);
         var childrenCount4 = networkService.productHaveChildren(downstreamDevice2.product);
         var childrenCount5 = networkService.productHaveChildren(subDownstreamDevice.product);
         var childrenCount6 = networkService.productHaveChildren(downstreamDevice3.product);

         // check
         expect(childrenCount1).toBe(true);
         expect(childrenCount2).toBe(true);
         expect(childrenCount3).toBe(false);
         expect(childrenCount4).toBe(true);
         expect(childrenCount5).toBe(false);
         expect(childrenCount6).toBe(false);
     });

     it('getChildIndex should give the correct index', function() {
         // prepare
         var productPack1 = testHelperFactory.createProductPack(1,1);
         var productPack2 = testHelperFactory.createProductPack(2,2);
         var productPack3 = testHelperFactory.createProductPack(3,3);
         var productPack4 = testHelperFactory.createProductPack(4,4);
         var productPack5 = testHelperFactory.createProductPack(5,5);

         // act
         var incomerDevice = networkService.startNetwork(productPack1, networkService.electricalDeviceType);
         var downstreamDevice1 = networkService.addDownstreamDevice(incomerDevice, productPack2, networkService.electricalDeviceType)[1];
         var distributionDevice = incomerDevice.children[0];
         var downstreamDevice2 = networkService.addDownstreamDevice(distributionDevice, productPack3, networkService.electricalDeviceType)[0];
         var downstreamDevice3 = networkService.addDownstreamDevice(distributionDevice, productPack4, networkService.electricalDeviceType)[0];
         var subDownstreamDevice = networkService.addDownstreamDevice(downstreamDevice2, productPack5, networkService.electricalDeviceType)[0];

         var index = networkService.getChildIndex(incomerDevice);
         var childIndex1 = networkService.getChildIndex(downstreamDevice1);
         var childIndex2 = networkService.getChildIndex(downstreamDevice2);
         var childIndex3 = networkService.getChildIndex(downstreamDevice3);
         var subChildIndex = networkService.getChildIndex(subDownstreamDevice);

         // check
         expect(index).toEqual(0);
         expect(childIndex1).toEqual(0);
         expect(childIndex2).toEqual(1);
         expect(childIndex3).toEqual(2);
         expect(subChildIndex).toEqual(0);
     });

     it('duplicateDevice should duplicate an incomer device', function() {
         // prepare
         var productPack1 = testHelperFactory.createProductPack(3,3);
         var productPack2 = testHelperFactory.createProductPack(2,2);

         // act
         var incomerDevice = networkService.startNetwork(productPack1, networkService.electricalDeviceType);
         var incomerDevice2 = networkService.addParallelDevice(incomerDevice, productPack2, networkService.electricalDeviceType);
         var duplicatedDevice = networkService.duplicateDevice(incomerDevice)[0];

         // check
         expect(duplicatedDevice.quantity).toEqual(3);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0]).toEqual(incomerDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1]).toEqual(incomerDevice2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[2]).toEqual(duplicatedDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[2].product.parts[0].part.price).toEqual(3);
     });

     it('duplicateDevice should duplicate a device', function() {
         // prepare
         var productPack1 = testHelperFactory.createProductPack(1,1);
         var productPack2 = testHelperFactory.createProductPack(2,2);
         var productPack3 = testHelperFactory.createProductPack(3,3);

         // act
         var incomerDevice = networkService.startNetwork(productPack1, networkService.electricalDeviceType);
         var downstreamDevice1 = networkService.addDownstreamDevice(incomerDevice, productPack2, networkService.electricalDeviceType)[1];
         var distributionDevice = incomerDevice.children[0];
         var downstreamDevice2 = networkService.addDownstreamDevice(distributionDevice, productPack3, networkService.electricalDeviceType)[0];
         var duplicatedDevice = networkService.duplicateDevice(downstreamDevice1)[0];

         // check
         expect(duplicatedDevice.quantity).toEqual(2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0]).toEqual(incomerDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0]).toEqual(distributionDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children.length).toEqual(3);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0]).toEqual(downstreamDevice1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[1]).toEqual(downstreamDevice2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[2]).toEqual(duplicatedDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[2].product.parts[0].part.price).toEqual(2);
     });

     it('copyPasteDevice should copy and paste an incomer device', function() {
         // prepare
         var productPack1 = testHelperFactory.createProductPack(3,3);
         var productPack2 = testHelperFactory.createProductPack(2,2);

         // act
         var incomerDevice = networkService.startNetwork(productPack1, networkService.electricalDeviceType);
         var incomerDevice2 = networkService.addParallelDevice(incomerDevice, productPack2, networkService.electricalDeviceType);
         var duplicatedDevice = networkService.copyPasteDevice(incomerDevice, null, 2, false)[0];

         // check
         expect(duplicatedDevice.quantity).toEqual(3);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0]).toEqual(incomerDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1]).toEqual(incomerDevice2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[2]).toEqual(duplicatedDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[2].product.parts[0].part.price).toEqual(3);
     });

     it('copyPasteDevice should copy and paste an incomer device downstream another device', function() {
         // prepare
         var productPack1 = testHelperFactory.createProductPack(3,3);
         var productPack2 = testHelperFactory.createProductPack(2,2);

         // act
         var incomerDevice = networkService.startNetwork(productPack1, networkService.electricalDeviceType);
         var incomerDevice2 = networkService.addParallelDevice(incomerDevice, productPack2, networkService.electricalDeviceType);
         //first element of the array is the distribution => take second element
         var duplicatedDevice = networkService.copyPasteDevice(incomerDevice, incomerDevice2, 0, false)[1];

         // check
         expect(duplicatedDevice.quantity).toEqual(3);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0]).toEqual(incomerDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1]).toEqual(incomerDevice2);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1].children.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1].children[0].children.length).toEqual(1);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1].children[0].children[0]).toEqual(duplicatedDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1].children[0].children[0].product.parts[0].part.price).toEqual(3);
     });

     it('ungroupDevice should refuse ungrouping 0 device', function() {
         // prepare
         var productPack = testHelperFactory.createProductPack(3,3);

         // act
         var incomerDevice = networkService.startNetwork(productPack, networkService.electricalDeviceType);
         var ungroupedDevices = networkService.ungroupDevice(incomerDevice, 0);

         // check
         expect(ungroupedDevices.length).toEqual(0);

     });

     it('ungroupDevice should refuse ungrouping too much devices', function() {
         // prepare
         var productPack = testHelperFactory.createProductPack(3,3);

         // act
         var incomerDevice = networkService.startNetwork(productPack, networkService.electricalDeviceType);
         var ungroupedDevices = networkService.ungroupDevice(incomerDevice, 3);

         // check
         expect(ungroupedDevices.length).toEqual(0);

     });

     it('ungroupDevice should correctly ungroup an incomer device', function() {
         // prepare
         var productPack = testHelperFactory.createProductPack(3,3);

         // act
         var incomerDevice = networkService.startNetwork(productPack, networkService.electricalDeviceType);
         var ungroupedDevices = networkService.ungroupDevice(incomerDevice, 1);

         // check
         expect(ungroupedDevices.length).toEqual(2);
         expect(ungroupedDevices[0].product).toEqual(incomerDevice.product);
         expect(ungroupedDevices[0].quantity).toEqual(2);
         expect(ungroupedDevices[1].product).not.toEqual(incomerDevice.product);
         ungroupedDevices[1].product.id = incomerDevice.product.id;
         expect(ungroupedDevices[1].product).toEqual(incomerDevice.product);
         expect(ungroupedDevices[1].quantity).toEqual(1);

         expect(Project.current.selectedSwitchboard.network.incomerDevices[0]).toEqual(ungroupedDevices[0]);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[1]).toEqual(ungroupedDevices[1]);
     });

     it('ungroupDevice should correctly ungroup a device', function() {
         // prepare
         var productPack1 = testHelperFactory.createProductPack(1,1);
         var productPack2 = testHelperFactory.createProductPack(4,4);
         var productPack3 = testHelperFactory.createProductPack(3,3);

         // act
         var incomerDevice = networkService.startNetwork(productPack1, networkService.electricalDeviceType);
         var downstreamDevice1 = networkService.addDownstreamDevice(incomerDevice, productPack2, networkService.electricalDeviceType)[1];
         var distributionDevice = incomerDevice.children[0];
         var downstreamDevice2 = networkService.addDownstreamDevice(distributionDevice, productPack3, networkService.electricalDeviceType)[0];
         var ungroupedDevices = networkService.ungroupDevice(downstreamDevice1, 1);

         // check
         expect(ungroupedDevices.length).toEqual(2);
         expect(ungroupedDevices[0].product).toEqual(downstreamDevice1.product);
         expect(ungroupedDevices[0].quantity).toEqual(3);
         expect(ungroupedDevices[1].product).not.toEqual(downstreamDevice1.product);
         ungroupedDevices[1].product.id = downstreamDevice1.product.id;
         expect(ungroupedDevices[1].product).toEqual(downstreamDevice1.product);
         expect(ungroupedDevices[1].quantity).toEqual(1);

         expect(Project.current.selectedSwitchboard.network.incomerDevices[0]).toEqual(incomerDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0]).toEqual(distributionDevice);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children.length).toEqual(3);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[0]).toEqual(ungroupedDevices[0]);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[1]).toEqual(ungroupedDevices[1]);
         expect(Project.current.selectedSwitchboard.network.incomerDevices[0].children[0].children[2]).toEqual(downstreamDevice2);
     });
 });
