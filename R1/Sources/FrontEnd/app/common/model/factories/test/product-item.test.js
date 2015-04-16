'use strict' ;

/**
 * Tests for ProductPack
 */
 describe('ProductPack', function(){

    var ProductPack,
        Product,
        Part,
        PartPack;

    beforeEach(function () {
        module('model');
    });

    beforeEach(inject(function(_ProductPack_, _Product_, _Part_, _PartPack_){
        ProductPack = _ProductPack_ ;
        Product = _Product_;
        Part = _Part_;
        PartPack = _PartPack_ ;
    }));

     it('Should compute the good price', function(){
         // prepare
         var part1 = new Part('partCode', 'longName', 'resCode', 20, 50);
         var part2 = new Part('partCode', 'longName', 'resCode', 20, 25);
         var partsPacks = [
             new PartPack(part1,2),
             new PartPack(part2,1)
         ];
         var product = new Product(partsPacks);
         var productPack = new ProductPack(product,2,null, null);

         // check
         expect(productPack.getPrice()).toEqual(120)
     });

     it('Should compute the good net price', function(){
         // prepare
         var part1 = new Part('partCode1', 'longName', 'resCode', 20, 50);
         var part2 = new Part('partCode2', 'longName', 'resCode', 20, 25);
         var partsPacks = [
             new PartPack(part1,2),
             new PartPack(part2,1)
         ];
         var product = new Product(partsPacks);
         var productPack = new ProductPack(product,2,null, null);

         // check
         expect(productPack.getNetPrice()).toEqual(70);
     });

 });
