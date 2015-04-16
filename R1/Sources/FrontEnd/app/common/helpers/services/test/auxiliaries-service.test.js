'use strict' ;

/**
 * Tests for auxiliaries service
 */
 describe('auxiliariesService', function(){

    var auxiliariesService, Product, Part, PartPack, testHelperFactory;

    beforeEach(function () {
        module('helpers');
        module('testHelper');
    });

    beforeEach(inject(function(_auxiliariesService_, _Part_, _PartPack_, _Product_, _testHelperFactory_){
        auxiliariesService = _auxiliariesService_ ;
        Part = _Part_ ;
        PartPack = _PartPack_ ;
        Product = _Product_;
        testHelperFactory = _testHelperFactory_ ;
    }));

     it ('HasAuxiliary returns false if product has no auxiliaries', function(){
         // prepare
         var product = testHelperFactory.createProduct();

         //check
         expect(auxiliariesService.hasAuxiliaries(product)).toEqual(false);
     });

     it ('HasAuxiliary returns true if product has auxiliaries', function(){
         // prepare
         var product = testHelperFactory.createProduct();
         var auxiliaryPart1 = new Part('partCode', 'longName', 'resCode', 20, 50, '', '', 'Auxiliaries');
         var partsPacks = [new PartPack(auxiliaryPart1,1)];

         auxiliariesService.setAuxiliaries(product, partsPacks);

         //check
         expect(auxiliariesService.hasAuxiliaries(product)).toEqual(true);
     });

     it ('setAuxiliaries should correctly add auxiliaries to a product and all the accessors should return the correct information', function(){
         // prepare
         var mainPart1 = new Part('mainPartCode1', 'longName', 'resCode', 0, 0, '', '', 'ElectricalDevices');
         var mainPart2 = new Part('mainPartCode2', 'longName', 'resCode', 0, 0, '', '', 'ElectricalDevices');
         var mainPartPack1 = new PartPack(mainPart1, 1);
         var mainPartPack2 = new PartPack(mainPart2, 2);
         var product = new Product([mainPartPack1, mainPartPack2]);

         var auxiliaryPart1 = new Part('auxiliaryPartCode1', 'longName', 'resCode', 20, 50, '', '', 'Auxiliaries');
         var auxiliaryPart2 = new Part('auxiliaryPartCode2', 'longName', 'resCode', 20, 50, '', '', 'Auxiliaries');
         var auxiliaryPartPacks = [new PartPack(auxiliaryPart1,1), new PartPack(auxiliaryPart2,2)];

         auxiliariesService.setAuxiliaries(product, auxiliaryPartPacks);

         //check
         expect(auxiliariesService.getMainParts(product)).toEqual([mainPartPack1, mainPartPack2]);
         expect(auxiliariesService.getAuxiliaries(product)).toEqual(auxiliaryPartPacks);
         // expect(auxiliariesService.getUnderscoredReferences(product)).toEqual('mainPartCode1_mainPartCode2_auxiliaryPartCode1_auxiliaryPartCode2'); TODO : commented after productId refacto
         // expect(auxiliariesService.getMainPartsUnderscoredReferences(product)).toEqual('mainPartCode1_mainPartCode2_mainPartCode2');
         expect(auxiliariesService.getAuxiliariesReferences(product)).toEqual([ 'auxiliaryPartCode1', 'auxiliaryPartCode2' ]);
     });
 });
