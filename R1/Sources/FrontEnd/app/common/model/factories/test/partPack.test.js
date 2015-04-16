'use strict' ;

/**
 * Tests for Part
 */
 describe('PartPack', function(){

    var PartPack;
    var Part;

    beforeEach(function () {
        module('model');
    });

    beforeEach(inject(function(_Part_, _PartPack_){
        Part = _Part_ ;
        PartPack = _PartPack_ ;
    }));

     it('should compute net price', function(){
         // prepare
         var part = new Part();
         part.price = 10 ;
         var partPack = new PartPack(part,1);

         // check
         expect(partPack.getNetPrice()).toEqual(10);
     });

     it('Get net price should take quantity into account', function(){
         // prepare
         var part = new Part();
         part.price = 10 ;
         var partPack = new PartPack(part,2);

         // check
         expect(partPack.getNetPrice()).toEqual(20);
     });
 });
