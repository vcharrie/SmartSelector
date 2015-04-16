'use strict' ;

/**
 * Tests for save-load-service
 */
describe('save-load-service', function() {


    var saveLoadService;
    var Filter;
    var RangeItem;
    var ProductPack;
    var Characteristic;
    var Product;
    var PartPack;
    var Part;
    var Solution;
    var Basket;

    beforeEach(function() {
        module('business');
    });

    beforeEach(inject(function(_saveLoadService_, _Filter_, _RangeItem_, _ProductPack_, _Characteristic_, _Product_, _PartPack_, _Part_, _Solution_, _Basket_) {
        saveLoadService = _saveLoadService_;
        Filter = _Filter_;
        RangeItem = _RangeItem_;
        ProductPack = _ProductPack_;
        Characteristic = _Characteristic_;
        Product = _Product_;
        PartPack = _PartPack_;
        Part = _Part_;
        Solution = _Solution_;
        Basket = _Basket_;
    }));

    it('should save and load a Filter', function() {
        var filterToSave = new Filter('RatedCurrent', Filter.equal, 160);
        var savedFilter = saveLoadService.saveFilter(filterToSave);
        var loadedFilter = saveLoadService.loadFilter(savedFilter);

        expect(savedFilter).toEqual(filterToSave);
        expect(loadedFilter).toEqual(filterToSave);
    });

    it('should save and load a RangeItem', function() {
        var permanentFilter01 = new Filter('RatedCurrent', Filter.equal, 160);
        var permanentFilter02 = new Filter('OperationalVoltage', Filter.lte, 60);
        var permanentFilter03 = new Filter('BasketBaskets', Filter.gte, 10);

        var rangeItemToSave = new RangeItem(
            'a big range',
            'type',
            null,
            {'a':1, 'b':2},
            [permanentFilter01, permanentFilter02, permanentFilter03],
            ['ignoredFilter1', 'ignoredFilter2'],
            [], //metaRanges
            '', // auxiliariesRangeName
            [],  // auxiliariesFilters
            '', // sections
            []  // level type
            );
        var expectedRangeItemAfterSaveOrLoad = rangeItemToSave;

        var savedRangeItem = saveLoadService.saveRangeItem(rangeItemToSave);
        var loadedRangeItem = saveLoadService.loadRangeItem(savedRangeItem);

        //because of javascript strange behavior, we have got here savedRangeItem.pictureUrl = undefined
        delete expectedRangeItemAfterSaveOrLoad.pictureUrl;
        expect(savedRangeItem).toEqual(expectedRangeItemAfterSaveOrLoad);

        // our service should not save the picture URL field.
        // so we put this field to null in the compared object
        expectedRangeItemAfterSaveOrLoad.pictureUrl = null;
        expect(loadedRangeItem).toEqual(expectedRangeItemAfterSaveOrLoad);
    });

    it('should save and load a ProductPack', function() {
        // prepare
        var filter01 = new Filter('electric', 'equal', 160);
        var filter02 = new Filter('mechanical', 'lte', 60);
        var characteristic01 = new Characteristic('foo', 'value one', ['a', 'b', 'c'], filter01, filter02, false, 'kA');
        var characteristic02 = new Characteristic('bar', 'second value', ['x', 'y', 'z'], filter01, filter02, false, 'V');
        var rangeItem = new RangeItem('a range', 'type', 'http://abcd/bigone.png', {'a':1, 'b':2}, [filter01, filter02]);
        var partsPacks = [
            new PartPack(new Part('partCode', 'longName', 'resCode', 21),2),
            new PartPack(new Part('partCode', 'longName', 'resCode', 21),1)
        ];
        var product = new Product(partsPacks);
        var productPackToSave = new ProductPack(product, 999, rangeItem, [characteristic01, characteristic02]);

        // act
        var savedProductPack = saveLoadService.saveProductPack(productPackToSave);
        var loadedProductPack = saveLoadService.loadProductPack(savedProductPack);
        // the pictureUrl property is not saved because it is retrieved from the db later
        delete loadedProductPack.rangeItem.pictureUrl;
        delete productPackToSave.rangeItem.pictureUrl;
        delete productPackToSave.product.id;
        delete loadedProductPack.product.id;

        // check
        expect(productPackToSave).toEqual(loadedProductPack);
    });

    it('should save / load a solution', function() {
        // prepare
        var filter01 = new Filter('electric', 'equal', 160);
        var filter02 = new Filter('mechanical', 'lte', 60);
        var characteristic01 = new Characteristic('foo', 'value one', ['a', 'b', 'c'], filter01, filter02, false, 'kA');
        var characteristic02 = new Characteristic('bar', 'second value', ['x', 'y', 'z'], filter01, filter02, false, 'V');
        var rangeItem = new RangeItem('a range', 'type', 'http://abcd/bigone.png', {'a':1, 'b':2}, [filter01, filter02]);
        var part = new Part('partCode', 'longName', 'resCode', 21);
        var partsPacks = [
            new PartPack(part,2),
            new PartPack(part,1)
        ];
        var product = new Product(partsPacks);
        var productPack = new ProductPack(product, 999, rangeItem, [characteristic01, characteristic02]);
        var solutionToSave = new Solution(
            'testSOlution',
            1,
            [part, part],
            38.34,
            402.3,
            49.1,
            57,
            3,
            'smoked',
            'surface',
            3,
            1,
            'CLASS_1',
            0
        );
        solutionToSave.products = [productPack, productPack, productPack];

        // act
        var solutionToLoad = saveLoadService.saveSolution(solutionToSave);
        var loadedSolution = saveLoadService.loadSolution(solutionToLoad);

        // check
        expect(loadedSolution.price).toEqual(0);
        expect(loadedSolution.products.length).toEqual(solutionToSave.products.length);

        var solutionToSaveObject = {
            name: solutionToSave.name,
            quantity: solutionToSave.quantity,
            parts: solutionToSave.parts,
            height: solutionToSave.height,
            width: solutionToSave.width,
            depth: solutionToSave.depth,
            ip: solutionToSave.ip,
            rows: solutionToSave.rows,
            numberOfVerticalModules: solutionToSave.numberOfVerticalModules,
            door: solutionToSave.door,
            installation: solutionToSave.installation,
            modulesWidth: solutionToSave.modulesWidth,
            freeSpace: solutionToSave.freeSpace
        };
        var loadedSolutionObject = {
            name: loadedSolution.name,
            quantity: loadedSolution.quantity,
            parts: loadedSolution.parts,
            height: loadedSolution.height,
            width: loadedSolution.width,
            depth: loadedSolution.depth,
            ip: loadedSolution.ip,
            rows: loadedSolution.rows,
            numberOfVerticalModules: loadedSolution.numberOfVerticalModules,
            door: loadedSolution.door,
            installation: loadedSolution.installation,
            modulesWidth: loadedSolution.modulesWidth,
            freeSpace: loadedSolution.freeSpace
        };
        expect(loadedSolutionObject).toEqual(solutionToSaveObject);
    });

    it('should save / load a Basket', function() {
        // prepare
        var onElementChanged = function() {var foo = 'bar';};
        var filter01 = new Filter('electric', 'equal', 160);
        var filter02 = new Filter('mechanical', 'lte', 60);
        var characteristic01 = new Characteristic('foo', 'value one', ['a', 'b', 'c'], filter01, filter02, false, 'kA');
        var characteristic02 = new Characteristic('bar', 'second value', ['x', 'y', 'z'], filter01, filter02, false, 'V');
        var rangeItem = new RangeItem('a range', 'type', 'http://abcd/bigone.png', {'a':1, 'b':2}, [filter01, filter02]);
        var part = new Part('partCode', 'longName', 'resCode', 21);
        var partsPacks = [
            new PartPack(part,2),
            new PartPack(part,1)
        ];
        var product = new Product(partsPacks);
        var productPack = new ProductPack(product, 999, rangeItem, [characteristic01, characteristic02]);
        var basketToSave = new Basket('originalBasket', onElementChanged);

        // act
        basketToSave.addProduct(productPack);
        var savedBasket = saveLoadService.saveBasket(basketToSave);
        var loadedBasket = saveLoadService.loadBasket(savedBasket, onElementChanged);

        // check
        expect(basketToSave.list.length).toEqual(loadedBasket.list.length);
    });
});
