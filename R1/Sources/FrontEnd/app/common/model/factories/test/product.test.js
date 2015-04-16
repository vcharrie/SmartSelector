'use strict' ;

/**
 * Tests for Product
 */
 describe('Product', function(){

    var Product,
        Part,
        PartPack,
        testHelperFactory;

    beforeEach(function () {
        module('model');
        module('testHelper');
    });

    beforeEach(inject(function(_Product_, _PartPack_, _Part_, _testHelperFactory_){
        Product = _Product_ ;
        Part = _Part_ ;
        PartPack = _PartPack_ ;
        testHelperFactory = _testHelperFactory_ ;
    }));

    it('should compute the good price', function () {
        var partsPacks = [
            new PartPack(new Part('partCode1', 'longName', 'resCode', 21, 50),2),
            new PartPack(new Part('partCode2', 'longName', 'resCode', 21, 25),1)
        ];

        var prod = new Product(partsPacks);

        expect(prod.price()).toEqual(63);
    });

     it('should compute the good net price', function () {
         // prepare
         var part1 = new Part('partCode1', 'longName', 'resCode', 20, 50);
         var part2 = new Part('partCode2', 'longName', 'resCode', 20, 25);
         var partsPacks = [
             new PartPack(part1,2),
             new PartPack(part2,1)
         ];
         var product = new Product(partsPacks);

         // check
         expect(product.getNetPrice()).toEqual(35);
     });
 });
