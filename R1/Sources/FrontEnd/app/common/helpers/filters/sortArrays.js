'use strict';


//Look for float starting strings
var floatStartingExpression = new RegExp('^[0-9]*\\.[0-9]+|^[0-9]+');

/* Filters */
angular.module('helpers').filter('orderBy1210ab', function (gettextCatalog) {

    /**
     * Test if input have to be sorted or not
     * @param inputToTest array for filter is values must be sorted
     * @returns {boolean} True the input must not be sorted. False otherwise
     */
    var mustNotSort = function (inputToTest) {
        var comparisonOperators = ['<', '>', '='];

        for (var i = 0; i <= comparisonOperators.length; i++) {
            var character = comparisonOperators[i];
            var characterIndex = inputToTest.indexOf(character);
            if (characterIndex === 0 || characterIndex === 1) {
                return true;
            }
        }

        return false;
    };

    var sortOrderBy1210Ab = function (c1, c2, translation) {
        var e1 = c1;
        var e2 = c2;
        if (translation) {
            e1 = gettextCatalog.getString(c1);
            e2 = gettextCatalog.getString(c2);
        }

        var r1 = floatStartingExpression.exec(e1);
        var r2 = floatStartingExpression.exec(e2);

        if ((!r1 || r1.length === 0) && (!r2 || r2.length === 0)) {
            //Only string
            if (e1 === null || e2 === null || mustNotSort(e1) || mustNotSort(e2)) {
                return 0;
            }

            return (e1 >= e2 ? 1 : -1);
        }

        //Two numbers
        if ((r1 && r1.length !== 0) && (r2 && r2.length !== 0)) {
            var f1 = parseFloat(r1[0]);
            var f2 = parseFloat(r2[0]);

            return (f1 > f2 ? 1 : (f1 === f2 ? (e1 >= e2 ? 1 : -1) : -1));
        }

        //number first
        if (r1 && r1.length !== 0) {
            //e1 first
            return -1;
        } else {
            //e2 first
            return 1;
        }
    };

    var sortOrderBy1210AbTranslation = function (e1, e2) {
        return sortOrderBy1210Ab(e1, e2, true);
    };

    return function (input, translation) {
        var out = [];
        for (var i in input) {
            if (input.hasOwnProperty(i)) {
                out.push(input[i]);
            }
        }
        if (translation) {
            return out.sort(sortOrderBy1210AbTranslation);
        } else {
            return out.sort(sortOrderBy1210Ab);
        }
    };
}).filter('orderByAb1210', function () {
    var sortOrderByAb1210 = function (e1, e2) {

        var r1 = floatStartingExpression.exec(e1);
        var r2 = floatStartingExpression.exec(e2);

        if ((!r1 || r1.length === 0) && (!r2 || r2.length === 0)) {
            //Only string
            return (e1 >= e2 ? 1 : -1);
        }

        //Two numbers
        if ((r1 && r1.length !== 0) && (r2 && r2.length !== 0)) {
            var f1 = parseFloat(r1[0]);
            var f2 = parseFloat(r2[0]);
            return (f1 > f2 ? 1 : (f1 === f2 ? (e1 >= e2 ? 1 : -1) : -1));
        }

        //number first
        if (r1 && r1.length !== 0) {
            //e1 first
            return 1;
        } else {
            //e2 first
            return -1;
        }
    };

    return function (input) {
        var out = [];
        for (var i in input) {
            if (input.hasOwnProperty(i)) {
                out.push(input[i]);
            }
        }
        return out.sort(sortOrderByAb1210);
    };
}).filter('unchanged', function () {
    return function (input) {
        var out = [];
        for (var i in input) {
            if (input.hasOwnProperty(i)) {
                out.push(input[i]);
            }
        }
        return out;
    };
}).filter('orderProductByRangeOrderAndPrice', function () {
    var sortProductByRangeOrderAndPrice = function (p1, p2) {
        if (p1.rangeOrder < p2.rangeOrder) {
            return -1;
        }

        if (p1.rangeOrder === p2.rangeOrder && p1.getNetPrice()< p2.getNetPrice()) {
            return -1;
        }

        if (p1.rangeOrder === p2.rangeOrder && p1.getNetPrice() === p2.getNetPrice()) {
            return 0;
        }

        return 1;
    };

    return function (input) {
        var out = [];
        for (var i in input) {
            if (input.hasOwnProperty(i)) {
                out.push(input[i]);
            }
        }
        return out.sort(sortProductByRangeOrderAndPrice);
    };
}).filter('orderBy_Ab1210', function () {
    var sortOrderByAb1210 = function (e1, e2) {

        var r1 = floatStartingExpression.exec(e1);
        var r2 = floatStartingExpression.exec(e2);

        if ((!r1 || r1.length === 0) && (!r2 || r2.length === 0)) {
            //Only string
            // Force INDIFFERENT_CHARACTERISTIC_VALUE to be the first element of the list
            if(e1 === 'INDIFFERENT_CHARACTERISTIC_VALUE') {
                return -1;
            }
            return (e1 >= e2 ? 1 : -1);
        }

        //Two numbers
        if ((r1 && r1.length !== 0) && (r2 && r2.length !== 0)) {
            var f1 = parseFloat(r1[0]);
            var f2 = parseFloat(r2[0]);
            return (f1 > f2 ? 1 : (f1 === f2 ? (e1 >= e2 ? 1 : -1) : -1));
        }

        //number first
        if (r1 && r1.length !== 0) {
            //e1 first
            return 1;
        } else {
            //e2 first
            return -1;
        }
    };

    return function (input) {
        var out = [];
        for (var i in input) {
            if (input.hasOwnProperty(i)) {
                out.push(input[i]);
            }
        }
        return out.sort(sortOrderByAb1210);
    };
});
