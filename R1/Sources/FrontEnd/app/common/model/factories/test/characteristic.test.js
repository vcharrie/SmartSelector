'use strict';

describe('Characteristic', function(){

    var Characteristic,
        testHelperFactory;

    beforeEach(function () {
        module('model');
        module('testHelper');
    });

    beforeEach(inject(function(_Characteristic_, _testHelperFactory_){
        Characteristic = _Characteristic_ ;
        testHelperFactory = _testHelperFactory_ ;
    }));

    it('getAsElectricalFilter should return Filter', function(){
       var characteristic = testHelperFactory.createCharacteristic();

        var electricalFilter = characteristic.getAsElectricalFilter();

        expect(electricalFilter.characteristic).toBe(characteristic.name);
        expect(electricalFilter.constraint).toBe(characteristic.filterElectric);
        expect(electricalFilter.value).toBe(characteristic.selectedValue);
    });

    it('getAsMechanicalFilter should return Filter', function(){
        var characteristic = testHelperFactory.createCharacteristic();

        var mechanicalFilter = characteristic.getAsMechanicalFilter();

        expect(mechanicalFilter.characteristic).toBe(characteristic.name);
        expect(mechanicalFilter.constraint).toBe(characteristic.filterMechanic);
        expect(mechanicalFilter.value).toBe(characteristic.selectedValue);
    });
});
