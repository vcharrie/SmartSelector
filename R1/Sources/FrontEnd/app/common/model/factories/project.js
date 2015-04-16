'use strict';

/**
 * @class angular_module.business.Project
 * @description Project data model
 */
angular.module('model').factory('Project', function(characteristicsHelper, Switchboard, SwitchboardPack) {

    /**
     * @property {boolean} isProjectDirty
     * @property {Number} version
     * @property {Function} onProjectChanged
     *
     * @param {String} name
     * @param {String} projectReference
     * @param {String} clientReference
     * @param {String} projectNote
     * @param {String} priceList
     * @constructor
     */
    var Project = function (name, projectReference, clientReference, projectNote, priceList) {
        this.isProjectDirty = false;
        this.version = 0;
        this._projectReference = projectReference;
        this._clientReference = clientReference;
        this._projectNote = projectNote;
        this._name = name;
        this._priceList=priceList;

        // Switchboards
        this._switchboards = [];
        this._selectedSwitchboardId = 0;
    };

    Project.prototype = {
        /**
         *
         * @returns {String}
         */
        get selectedSwitchboardPack() {
            return this._switchboards[this._selectedSwitchboardId];
        },
        /**
         *
         * @returns {String}
         */
        get selectedSwitchboard() {
            return this._switchboards[this._selectedSwitchboardId].switchboard;
        },
        /**
         *
         * @returns {String}
         */
        get name() {
            return this._name;
        },
        /**
         *
         * @param {String} val
         */
        set name(val) {
            if (val !== this._name) {
                this._name = val;
                this.isProjectDirty = true;
            }
        },
        /**
         *
         * @returns {String}
         */
        get clientReference() {
            return this._clientReference;
        },
        /**
         *
         * @param {String} val
         */
        set clientReference(val) {
            if (val !== this._clientReference) {
                this._clientReference = val;
                this.isProjectDirty = true;
            }
        },
        /**
         *
         * @returns {String}
         */
        get projectReference() {
            return this._projectReference;
        },
        /**
         *
         * @param {String} val
         */
        set projectReference(val) {
            if (val !== this._projectReference) {
                this._projectReference = val;
                this.isProjectDirty = true;
            }
        },
        /**
         *
         * @returns {String}
         */
        get projectNote() {
            return this._projectNote;
        },
        /**
         *
         * @param {String} val
         */
        set projectNote(val) {
            if (val !== this._projectNote) {
                this._projectNote = val;
                this.isProjectDirty = true;
            }
        },

        /**
         *
         * @returns {String}
         */
        get priceList() {
            return this._priceList;
        },
        /**
         *
         * @param {String} val
         */
        set priceList(val) {
            this._priceList=val;
        },
        /**
         *
         * @returns {Array}
         */
        get switchboardPacks() {
            return this._switchboards;
        },
        /**
         *
         * @param {Array} val
         */
        set switchboardPacks(val) {
            this._switchboards=val;
        }
    };

    /**
     * @description Callback when a switchboard is modified : the project become dirty
     * @type {function}
     */
    Project.prototype.onSwitchboardChanged = function () {
        var that = this;
        return function () {
            that.isProjectDirty = true;
        };
    };

    /**
     *
     * @returns {number}
     */
    Project.prototype.getTotalPrice = function() {
        var price = this.selectedSwitchboard.getTotalPrice();
        return Math.round(price * 100) / 100;
    };

    /**
     * @description Return the net price of the project (discount is taken into account)
     * @returns {number}
     */
    Project.prototype.getNetPrice = function() {
        return this.selectedSwitchboard.getNetPrice();
    };

    /**
     * @description Create a switchboard pack
     * @returns {SwitchboardPack}
     */
    Project.prototype.createSwitchboard = function(name, quantity, selectedForBom, type) {

        var switchboard = new Switchboard(name, this.onSwitchboardChanged());
        var switchboardPack = new SwitchboardPack(switchboard, quantity, selectedForBom, type);
        this._switchboards.push(switchboardPack);
        if (type !== 'other'){
            this._selectedSwitchboardId = this._switchboards.indexOf(switchboardPack);
            this.isProjectDirty = true;
        }

        return switchboardPack;
    };

    /**
     * @description Delete a switchboard pack
     */
    Project.prototype.deleteSwitchboard = function(switchboardPack) {

        var currentSelectedSwitchboardPack = this._switchboards[this._selectedSwitchboardId];
        var switchboardIndex = this._switchboards.indexOf(switchboardPack);
        this._switchboards.splice(switchboardIndex, 1);

        // Refresh current selected switchboard id
        this._selectedSwitchboardId = this._switchboards.indexOf(currentSelectedSwitchboardPack);
        // Select the first switchboard if we are deleting the current one
        if(this._selectedSwitchboardId === -1){
            this._selectedSwitchboardId = 0;
        }
        this.isProjectDirty = true;
    };

    /**
     * @description Duplicates a switchboard pack
     * @returns {SwitchboardPack}
     */
    Project.prototype.duplicateSwitchboard = function(switchboardPack, newName) {
        var switchboard = angular.copy(switchboardPack.switchboard);
        switchboard.name = newName;
        switchboard.onSwitchboardChanged = this.onSwitchboardChanged();
        switchboard.setBasketChangedCallback();
        var newSwitchboardPack = new SwitchboardPack(switchboard, switchboardPack.quantity, switchboardPack.isSelectedForBom, switchboardPack.type);
        newSwitchboardPack.isSelectedForBom = switchboardPack.isSelectedForBom;
        var indexOfOriginal = this._switchboards.indexOf(switchboardPack);
        this._switchboards.splice(indexOfOriginal+1, 0, newSwitchboardPack);
        this._selectedSwitchboardId = this._switchboards.indexOf(newSwitchboardPack);
        this.isProjectDirty = true;

        return newSwitchboardPack;
    };

    /**
     * @description Moves a switchboard pack up
     */
    Project.prototype.moveUpSwitchboard = function(switchboardPack) {
        var switchboardIndex = this._switchboards.indexOf(switchboardPack);
        var wasSelected = (this._selectedSwitchboardId === switchboardIndex);
        var switchedWasSelected = (this._selectedSwitchboardId === switchboardIndex-1);
        if (switchboardIndex > 0) {
            var oldTopSwitchboard = this._switchboards[switchboardIndex-1];
            this._switchboards[switchboardIndex-1] = this._switchboards[switchboardIndex];
            this._switchboards[switchboardIndex] = oldTopSwitchboard;
            if (wasSelected) {
                this._selectedSwitchboardId = switchboardIndex-1;
            } else if (switchedWasSelected) {
                this._selectedSwitchboardId = switchboardIndex;
            }
        }
        this.isProjectDirty = true;
    };

    /**
     * @description Moves a switchboard pack down
     */
    Project.prototype.moveDownSwitchboard = function(switchboardPack) {
        var switchboardIndex = this._switchboards.indexOf(switchboardPack);
        var wasSelected = (this._selectedSwitchboardId === switchboardIndex);
        var switchedWasSelected = (this._selectedSwitchboardId === switchboardIndex+1);
        if (switchboardIndex < this._switchboards.length - 1) {
            var oldBottomSwitchboard = this._switchboards[switchboardIndex+1];
            this._switchboards[switchboardIndex+1] = this._switchboards[switchboardIndex];
            this._switchboards[switchboardIndex] = oldBottomSwitchboard;
            if (wasSelected) {
                this._selectedSwitchboardId = switchboardIndex + 1;
            } else if (switchedWasSelected) {
                this._selectedSwitchboardId = switchboardIndex;
            }
        }
        this.isProjectDirty = true;
    };

    /**
     * @description Get a switchboard pack index
     */
    Project.prototype.getSwitchboardIndex = function(switchboardPack) {
        return this._switchboards.indexOf(switchboardPack);
    };

    /**
     * @description Get size of switchboard array
     */
    Project.prototype.getSwitchboardsSize = function() {
        return this._switchboards.length;
    };

    /**
     * @description Select a switchboard pack
     */
    Project.prototype.selectSwitchboard = function(switchboardPack) {
        this._selectedSwitchboardId = this._switchboards.indexOf(switchboardPack);
    };

    /**
     * @description Looks for all switchboards starting with name parameter, and gets the last indexed one
     */
    Project.prototype.getLastSwitchboardNumberNamed = function (name) {
        // set -1 if you want the first item has no number
        var lastIndex = 0;
        for (var switchboard in this._switchboards) {
            var currentName = this._switchboards[switchboard].switchboard.name;
            if (currentName && currentName === name && lastIndex<0) {
                lastIndex = 0;
            } else if (currentName && currentName.indexOf(name)===0) {
                var currentNumber = parseInt(currentName.substring(name.length>0 ? (name.length+1) : 0,currentName.length));
                if (currentNumber && currentNumber>lastIndex) {
                    lastIndex = currentNumber;
                }
            }
        }
        return lastIndex;
    };

    Project.prototype.current = null ;

    return Project;
});