'use strict' ;

/**
 * Tests for Part
 */
 describe('Part', function(){

    var Part;

    beforeEach(function () {
        module('model');
    });

    beforeEach(inject(function(_Part_){
        Part = _Part_ ;
    }));

    it('should set discount', function(){
        var part = new Part('code');
        Part.discount = 10 ;
        Part.partDictionary['code']={};
        Part.partDictionary['code'].priceInfo = {price: 1, discount: 10};

        expect(part.discount).toBe(10);
    });



     it('should set discount to 0 if discount is nan', function(){
         var part = new Part();
         part.discount = 10 ;
         part.discount = "toto" ;

         expect(part.discount).toBe(0);
     });

     it('should compute net price', function(){

         var part = new Part('code');
         Part.partDictionary['code']={};
         Part.partDictionary['code'].priceInfo = {price: 10, discount: 10};

         expect(isNaN(parseFloat(part.getNetPrice()))).toBe(false);

         Part.partDictionary['code'].priceInfo.discount = 200;
         expect(isNaN(parseFloat(part.getNetPrice()))).toBe(false);
         Part.partDictionary['code'].priceInfo.discount = 50;
         expect(part.getNetPrice()).toBe(5);
     });
 });
