/**
* This file uses the Page Object pattern for protractor tests for project context page
*/

var ProjectContextPage = function() {
    this.pageUrl = 'project-context';

    var indexOfCurrentDropDown = 1;
	this.ratedCurrentDropdown = element(by.css('.project-context-container .project-context-characteristic:nth-child(' + indexOfCurrentDropDown + ') .charact-button'));
	this.ratedCurrentDropdownValuesSelector = by.css('.project-context-container .project-context-characteristic:nth-child(' + indexOfCurrentDropDown + ') .project-context-dropdown-menu li a');

    this.characteristicsDropdowns = by.css('.project-context-container .project-context-characteristic .btn-group .dropdown-toggle .dropdown-btn-selected-value');
    this.characteristicsDropdownsOpen = by.css('.project-context-container .project-context-characteristic .open .dropdown-toggle .dropdown-btn-selected-value');
    this.openCharacteristicDropdownsItems = by.css('.project-context-container .project-context-characteristic .open li a');

    this.clearButton = element(by.css('.project-context-container .btn-default'));

	this.insulationDropdown = element(by.css('.project-context-container .project-context-characteristic:nth-child(2) .charact-button'));

	this.ipDropdown = element(by.css('.project-context-container .project-context-characteristic:nth-child(3) .charact-button'));
};

module.exports = new ProjectContextPage();