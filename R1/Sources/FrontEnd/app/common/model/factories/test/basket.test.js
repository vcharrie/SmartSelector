'use strict' ;

/**
 * Tests for Basket
 */
describe('Basket', function() {

    var Basket,
        testHelperFactory;

    beforeEach(function () {
        module('model');
        module('testHelper');
    });

    beforeEach(inject(function (_Basket_, _testHelperFactory_) {
        Basket = _Basket_;
        testHelperFactory = _testHelperFactory_;
    }));

    it('should have a name', function () {
        // setup/act
        var basket = new Basket('name');

        // verify
        expect(basket.name).toBe('name');
    });

    it('should initializes empty', function () {
        // setup/act
        var basket = new Basket('name');

        // verify
        expect(basket.list.length).toBe(0);
    });

    it('should contains product item', function() {
        // setup
        var basket = new Basket('name');

        // act
        var result = basket.addProduct(testHelperFactory.createProductPack());

        // expect
        expect(result).toBe(true);
        expect(basket.list.length).toBe(1);
    });

    it('should returns total product count', function() {
        // setup
        var basket = new Basket('name');

        // act
        basket.addProduct(testHelperFactory.createProductPack(1, 1)); // price, quantity
        basket.addProduct(testHelperFactory.createProductPack(1, 2));
        basket.addProduct(testHelperFactory.createProductPack(1, 3));

        // expect
        expect(basket.getTotalProductCount()).toBe(1 + 2 + 3);
    });
});