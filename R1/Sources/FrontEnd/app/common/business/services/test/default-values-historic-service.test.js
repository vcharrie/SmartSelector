'use strict' ;



/**
 * Tests for defaultValuesHistoricService
 */
 describe('defaultValuesHistoricService', function() {

    var Filter;
    var defaultValuesHistoricService;
    var projectContextCharacteristics;
    var selectedProductsRange;

    var objectToFilters = function(object) {
        var filters = [];
        for(var characteristic in object) {
            filters.push(new Filter(characteristic, Filter.equal, object[characteristic]));
        };
        return filters;
    }
    
    beforeEach(function () {
        module('business');
    });

    beforeEach(inject(function(_defaultValuesHistoricService_, _Filter_){
        defaultValuesHistoricService = _defaultValuesHistoricService_ ;
        Filter = _Filter_;


        projectContextCharacteristics = [
            new Filter('RatedCurrent', Filter.equal, 160),
            new Filter('RatedOperationalVoltage', Filter.equal, '380-415'),
            new Filter('IP', Filter.equal, 30),
            new Filter('Insulation', Filter.equal, 'Insulating')
        ];
        selectedProductsRange = 'ModularCircuitBreaker';
    }));

    it('should build an historic key', function () {
        var manualHistoricKey = 'RatedCurrent-160-RatedOperationalVoltage-380-415-IP-30-Insulation-Insulating-ModularCircuitBreaker';

        var historicKey = defaultValuesHistoricService.getHistoricKey(projectContextCharacteristics, selectedProductsRange);

        expect(historicKey).toEqual(manualHistoricKey);
    });

    it('should set an array', function () {
        var historicKey = defaultValuesHistoricService.getHistoricKey(projectContextCharacteristics, selectedProductsRange);

        var object1 = {
            'Poles': '4P',
            'RatedCurrent':63,
            'BreakingCapacity':10,
            'used' : 1
        };
        var object2 = {
            'Poles': '4P',
            'RatedCurrent':63,
            'BreakingCapacity':100,
            'used' : 3
        };
        var object3 = {
            'Poles': '4P',
            'RatedCurrent':63,
            'BreakingCapacity':50,
            'used' : 1
        };
        var object4 = {
            'Poles': '3P',
            'RatedCurrent':63,
            'BreakingCapacity':10,
            'used' : 1
        };

        var array = [object2, object4, object1, object3];
        defaultValuesHistoricService.setDefaultValuesHistoric(historicKey, array);

        var storedArray = defaultValuesHistoricService.getDefaultValuesHistoric(historicKey);
        expect(storedArray).toEqual(array);
    });
    
    it('should increment an usage for a non yet added product', function () {
        var historicKey = defaultValuesHistoricService.getHistoricKey(projectContextCharacteristics, selectedProductsRange);

        var object1 = {
            'Poles': '4P',
            'RatedCurrent':63,
            'BreakingCapacity':10,
            'used' : 1
        };
        var object2 = {
            'Poles': '4P',
            'RatedCurrent':63,
            'BreakingCapacity':100,
            'used' : 3
        };
        var object3 = {
            'Poles': '4P',
            'RatedCurrent':63,
            'BreakingCapacity':50,
            'used' : 1
        };
        var object4 = {
            'Poles': '3P',
            'RatedCurrent':63,
            'BreakingCapacity':10,
            'used' : 1
        };

        var array = [object2, object4, object1, object3];
        defaultValuesHistoricService.setDefaultValuesHistoric(historicKey, array);

        var characteristics = [
            new Filter('Poles', Filter.equal, '2P'),
            new Filter('RatedCurrent', Filter.equal, 63),
            new Filter('BreakingCapacity', Filter.equal, 50)
        ];
        var object5 = {
            'Poles': '2P',
            'RatedCurrent':63,
            'BreakingCapacity':50,
            'used' : 1,
            productKeys: {
                undefined: 1
            }
        };
        
        var incrementedArray = [object2, object5, object4, object1, object3];
        defaultValuesHistoricService.incrementDefaultValuesUsage(historicKey, characteristics);
        var storedArray = defaultValuesHistoricService.getDefaultValuesHistoric(historicKey);
        expect(storedArray).toEqual(incrementedArray);
    });

    
    it('should increment an usage for a yet added product', function () {
        var historicKey = defaultValuesHistoricService.getHistoricKey(projectContextCharacteristics, selectedProductsRange);

        var object1 = {
            'Poles': '4P',
            'RatedCurrent':63,
            'BreakingCapacity':10,
            'used' : 1
        };
        var object2 = {
            'Poles': '4P',
            'RatedCurrent':63,
            'BreakingCapacity':100,
            'used' : 3
        };
        var object3 = {
            'Poles': '4P',
            'RatedCurrent':63,
            'BreakingCapacity':50,
            'used' : 1
        };
        var object4 = {
            'Poles': '3P',
            'RatedCurrent':63,
            'BreakingCapacity':10,
            'used' : 1
        };

        var array = [object2, object4, object1, object3];
        defaultValuesHistoricService.setDefaultValuesHistoric(historicKey, array);

        var characteristics = [
            new Filter('Poles', Filter.equal, '4P'),
            new Filter('RatedCurrent', Filter.equal, 63),
            new Filter('BreakingCapacity', Filter.equal, 50)
        ];
        var object5 = {
            'Poles': '4P',
            'RatedCurrent':63,
            'BreakingCapacity':50,
            'used' : 2,
            productKeys: {
                undefined: 1
            }
        };
        
        var incrementedArray = [object2, object5, object4, object1];
        defaultValuesHistoricService.incrementDefaultValuesUsage(historicKey, characteristics);
        var storedArray = defaultValuesHistoricService.getDefaultValuesHistoric(historicKey);
        expect(storedArray).toEqual(incrementedArray);
    });

    it('should find the right default values', function () {
        
        var historicKey = defaultValuesHistoricService.getHistoricKey(projectContextCharacteristics, selectedProductsRange);
        // set a clean local storage
        defaultValuesHistoricService.setDefaultValuesHistoric(historicKey, []);
        
        var object1 = {
            'Poles': '4P',
            'RatedCurrent':63,
            'BreakingCapacity':100
        };
        var object2 = {
            'Poles': '1P',
            'RatedCurrent':63,
            'BreakingCapacity':100
        };
        var object3 = {
            'Poles': '2P',
            'RatedCurrent':10,
            'BreakingCapacity':10
        };
        var object4 = {
            'Poles': '3P',
            'RatedCurrent':32,
            'BreakingCapacity':10
        };
        var object5 = {
            'Poles': '2P',
            'RatedCurrent':10,
            'BreakingCapacity':100
        };
        var object6 = {
            'Poles': '3P',
            'RatedCurrent':32,
            'BreakingCapacity':6
        };
        var object7 = {
            'Poles': '4P',
            'RatedCurrent':63,
            'BreakingCapacity':10
        };
        var object8 = {
            'Poles': '4P',
            'RatedCurrent':63,
            'BreakingCapacity':50
        };
        var object9 = {
            'Poles': '4P',
            'RatedCurrent':32,
            'BreakingCapacity':10
        };

        // add all objects like it will be in the app
        defaultValuesHistoricService.incrementDefaultValuesUsage(historicKey, objectToFilters(object1));
        defaultValuesHistoricService.incrementDefaultValuesUsage(historicKey, objectToFilters(object1));
        defaultValuesHistoricService.incrementDefaultValuesUsage(historicKey, objectToFilters(object1));

        defaultValuesHistoricService.incrementDefaultValuesUsage(historicKey, objectToFilters(object2));
        defaultValuesHistoricService.incrementDefaultValuesUsage(historicKey, objectToFilters(object2));

        defaultValuesHistoricService.incrementDefaultValuesUsage(historicKey, objectToFilters(object3));
        defaultValuesHistoricService.incrementDefaultValuesUsage(historicKey, objectToFilters(object3));

        defaultValuesHistoricService.incrementDefaultValuesUsage(historicKey, objectToFilters(object4));
        defaultValuesHistoricService.incrementDefaultValuesUsage(historicKey, objectToFilters(object4));   

        defaultValuesHistoricService.incrementDefaultValuesUsage(historicKey, objectToFilters(object5));
        defaultValuesHistoricService.incrementDefaultValuesUsage(historicKey, objectToFilters(object6));
        defaultValuesHistoricService.incrementDefaultValuesUsage(historicKey, objectToFilters(object7));
        defaultValuesHistoricService.incrementDefaultValuesUsage(historicKey, objectToFilters(object8));
        defaultValuesHistoricService.incrementDefaultValuesUsage(historicKey, objectToFilters(object9));    

        var characteristicsImpossibleValue = [
            new Filter('Poles', Filter.equal, 'ImpossibleValue')
        ];
        var characteristicsNotExistingCombination = [
            new Filter('Poles', Filter.equal, '1P'),
            new Filter('RatedCurrent', Filter.equal, 10),
            new Filter('BreakingCapacity', Filter.equal, 10)
        ];

        var impossibleDefaultValue1 = defaultValuesHistoricService.searchDefaultFilters(historicKey, characteristicsImpossibleValue);
        var impossibleDefaultValue2 = defaultValuesHistoricService.searchDefaultFilters(historicKey, characteristicsNotExistingCombination);
        expect(impossibleDefaultValue1).toEqual(undefined);
        expect(impossibleDefaultValue2).toEqual(undefined);

        var characteristicsEmpty = [];
        var characteristics1 = [
            new Filter('Poles', Filter.equal, '1P')
        ];
        var characteristics2 = [
            new Filter('Poles', Filter.equal, '2P')
        ];
        var characteristics3 = [
            new Filter('Poles', Filter.equal, '3P')
        ];
        var characteristics4 = [
            new Filter('Poles', Filter.equal, '4P')
        ];
        var characteristics5 = [
            new Filter('RatedCurrent', Filter.equal, 10)
        ];
        var characteristics6 = [
            new Filter('RatedCurrent', Filter.equal, 32)
        ];
        var characteristics7 = [
            new Filter('RatedCurrent', Filter.equal, 63)
        ];
        var characteristics8 = [
            new Filter('BreakingCapacity', Filter.equal, 6)
        ];
        var characteristics9 = [
            new Filter('BreakingCapacity', Filter.equal, 10)
        ];
        var characteristics10 = [
            new Filter('BreakingCapacity', Filter.equal, 50)
        ];
        var characteristics11 = [
            new Filter('BreakingCapacity', Filter.equal, 100)
        ];
        var characteristics12 = [
            new Filter('Poles', Filter.equal, '2P'),
            new Filter('BreakingCapacity', Filter.equal, 100)
        ];
        var characteristics13 = [
            new Filter('Poles', Filter.equal, '3P'),
            new Filter('BreakingCapacity', Filter.equal, 6)
        ];
        var characteristics14 = [
            new Filter('Poles', Filter.equal, '4P'),
            new Filter('RatedCurrent', Filter.equal, 32)
        ];
        
        var defaultValue0 = defaultValuesHistoricService.searchDefaultFilters(historicKey, characteristicsEmpty);
        var defaultValue1 = defaultValuesHistoricService.searchDefaultFilters(historicKey, characteristics1);
        var defaultValue2 = defaultValuesHistoricService.searchDefaultFilters(historicKey, characteristics2);
        var defaultValue3 = defaultValuesHistoricService.searchDefaultFilters(historicKey, characteristics3);
        var defaultValue4 = defaultValuesHistoricService.searchDefaultFilters(historicKey, characteristics4);
        var defaultValue5 = defaultValuesHistoricService.searchDefaultFilters(historicKey, characteristics5);
        var defaultValue6 = defaultValuesHistoricService.searchDefaultFilters(historicKey, characteristics6);
        var defaultValue7 = defaultValuesHistoricService.searchDefaultFilters(historicKey, characteristics7);
        var defaultValue8 = defaultValuesHistoricService.searchDefaultFilters(historicKey, characteristics8);
        var defaultValue9 = defaultValuesHistoricService.searchDefaultFilters(historicKey, characteristics9);
        var defaultValue10 = defaultValuesHistoricService.searchDefaultFilters(historicKey, characteristics10);
        var defaultValue11 = defaultValuesHistoricService.searchDefaultFilters(historicKey, characteristics11);
        var defaultValue12 = defaultValuesHistoricService.searchDefaultFilters(historicKey, characteristics12);
        var defaultValue13 = defaultValuesHistoricService.searchDefaultFilters(historicKey, characteristics13);
        var defaultValue14 = defaultValuesHistoricService.searchDefaultFilters(historicKey, characteristics14);
        
        expect(defaultValue0).toEqual(objectToFilters(object1));
        expect(defaultValue1).toEqual(objectToFilters(object2));
        expect(defaultValue2).toEqual(objectToFilters(object3));
        expect(defaultValue3).toEqual(objectToFilters(object4));
        expect(defaultValue4).toEqual(objectToFilters(object1));
        expect(defaultValue5).toEqual(objectToFilters(object3));
        expect(defaultValue6).toEqual(objectToFilters(object4));
        expect(defaultValue7).toEqual(objectToFilters(object1));
        expect(defaultValue8).toEqual(objectToFilters(object6));
        expect(defaultValue9).toEqual(objectToFilters(object3));
        expect(defaultValue10).toEqual(objectToFilters(object8));
        expect(defaultValue11).toEqual(objectToFilters(object1));
        expect(defaultValue12).toEqual(objectToFilters(object5));
        expect(defaultValue13).toEqual(objectToFilters(object6));
        expect(defaultValue14).toEqual(objectToFilters(object9));
    });
 });
