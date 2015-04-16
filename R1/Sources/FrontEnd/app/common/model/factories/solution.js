'use strict';

/**
 * @class angular_module.business.Solution
 * @description Solution data model
 */
angular.module('model').factory('Solution', function() {

    /**
     * @property {Number} quantity
     * @property {String[]} parts
     * @property {String} name
     * @property {Number} height
     * @property {Number} width
     * @property {Number} depth
     * @property {String} range
     * @property {String} ip
     * @property {Number} rows
     * @property {Number} numberOfVerticalModules
     * @property {String} door
     * @property {String} installation
     * @property {Number} modulesWidth
     * @property {Number} freeSpace
     * @property {ProductPack[]} products
     * @property {Distribution} mainDistribution
     * @property {ProductPack[]} distributions
     * @property {ProductPack[]} functionalUnits
     * @property {String} engineEnclosureSolution
     * @property {Array} alternativeRanges
     * @param {String} name
     * @param {Number} quantity
     * @param {String} parts
     * @param {Number} height
     * @param {Number} width
     * @param {Number} depth
     * @param {String} range
     * @param {String} ip
     * @param {Number} rows
     * @param {Number} numberOfVerticalModules
     * @param {String} door
     * @param {String} installation
     * @param {String} isolation
     * @param {Number} modulesWidth
     * @param {String} doorDuct
     * @param {Number} freeSpace
     * @param {Distribution} mainDistribution
     * @param {String} compositionScript
     * @param {Array} messages
     * @param {Array} alternativeRanges
     * @param {String} incomingInDuct
     * @param {String} wireOutgoingInDuct
     * @constructor
     */
    var Solution = function(name, quantity, parts, height, width, depth, range, ip, rows, numberOfVerticalModules, door, installation, isolation, modulesWidth, doorDuct, freeSpace, mainDistribution, compositionScript, messages, alternativeRanges, incomingInDuct, wireOutgoingInDuct) {

        this.quantity = quantity;
        this.parts = parts;
        this.name = name;

        // dimensions
        this.height = height;
        this.width = width;
        this.depth = depth;

        // characteristics
        this.range = range;
        this.ip = ip;
        this.rows = rows;
        this.numberOfVerticalModules = numberOfVerticalModules;
        this.door = door;
        this.doorDuct = doorDuct;
        this.installation = installation;
        this.isolation = isolation;
        this.modulesWidth = modulesWidth;
        this.freeSpace = freeSpace;

        // products
        this.products = [];

        // main distribution
        this.mainDistribution = mainDistribution ;
        this.distributions = [] ;

        //functional units
        this.functionalUnits = [] ;

        //frontViewDescription
        // hack : store the whole object returned by java as it will be send in future 3d generation request
        this.compositionScript = compositionScript ;

        // information, warnings and error messages that occurred during the solution search
        this.messages = messages;

        this.alternativeRanges = alternativeRanges;
        this.incomingInDuct = incomingInDuct;
        this.wireOutgoingInDuct = wireOutgoingInDuct;
    };

    /**
     *
     * @returns {number}
     */
    Solution.prototype.getPrice = function() {
        var price = 0;
        this.products.forEach(function(productPack) {
            price += productPack.getPrice();
        });
        return price;
    };

    return Solution;
});