'use strict';

angular.module('countryService', [])
    .provider('countryService', function() {
    	var countries = [
             {iso: 'INT', name: 'International', active: 'true'},
             {iso: 'AF', name: 'Afghanistan', active: 'false'},
             {iso: 'AX', name: 'Åland Islands', active: 'false'},
             {iso: 'AL', name: 'Albania', active: 'false'},
             {iso: 'DZ', name: 'Algeria', active: 'false'},
             {iso: 'AS', name: 'American Samoa', active: 'false'},
             {iso: 'AD', name: 'Andorra', active: 'false'},
             {iso: 'AO', name: 'Angola', active: 'false'},
             {iso: 'AI', name: 'Anguilla', active: 'false'},
             {iso: 'AQ', name: 'Antarctica', active: 'false'},
             {iso: 'AG', name: 'Antigua and Barbuda', active: 'false'},
             {iso: 'AR', name: 'Argentina', active: 'false'},
             {iso: 'AM', name: 'Armenia', active: 'false'},
             {iso: 'AW', name: 'Aruba', active: 'false'},
             {iso: 'AU', name: 'Australia', active: 'false'},
             {iso: 'AT', name: 'Austria', active: 'false'},
             {iso: 'AZ', name: 'Azerbaijan', active: 'false'},
             {iso: 'BS', name: 'Bahamas', active: 'false'},
             {iso: 'BH', name: 'Bahrain', active: 'false'},
             {iso: 'BD', name: 'Bangladesh', active: 'false'},
             {iso: 'BB', name: 'Barbados', active: 'false'},
             {iso: 'BY', name: 'Belarus', active: 'false'},
             {iso: 'BE', name: 'Belgium', active: 'false'},
             {iso: 'BZ', name: 'Belize', active: 'false'},
             {iso: 'BJ', name: 'Benin', active: 'false'},
             {iso: 'BM', name: 'Bermuda', active: 'false'},
             {iso: 'BT', name: 'Bhutan', active: 'false'},
             {iso: 'BO', name: 'Bolivia, Plurinational State of', active: 'false'},
             {iso: 'BQ', name: 'Bonaire, Sint Eustatius and Saba', active: 'false'},
             {iso: 'BA', name: 'Bosnia and Herzegovina', active: 'false'},
             {iso: 'BW', name: 'Botswana', active: 'false'},
             {iso: 'BV', name: 'Bouvet Island', active: 'false'},
             {iso: 'BR', name: 'Brazil', active: 'false'},
             {iso: 'IO', name: 'British Indian Ocean Territory', active: 'false'},
             {iso: 'BN', name: 'Brunei Darussalam', active: 'false'},
             {iso: 'BG', name: 'Bulgaria', active: 'false'},
             {iso: 'BF', name: 'Burkina Faso', active: 'false'},
             {iso: 'BI', name: 'Burundi', active: 'false'},
             {iso: 'CV', name: 'Cabo Verde', active: 'false'},
             {iso: 'KH', name: 'Cambodia', active: 'false'},
             {iso: 'CM', name: 'Cameroon', active: 'false'},
             {iso: 'CA', name: 'Canada', active: 'false'},
             {iso: 'KY', name: 'Cayman Islands', active: 'false'},
             {iso: 'CF', name: 'Central African Republic', active: 'false'},
             {iso: 'TD', name: 'Chad', active: 'false'},
             {iso: 'CL', name: 'Chile', active: 'false'},
             {iso: 'CN', name: 'China', active: 'false'},
             {iso: 'CX', name: 'Christmas Island', active: 'false'},
             {iso: 'CC', name: 'Cocos (Keeling) Islands', active: 'false'},
             {iso: 'CO', name: 'Colombia', active: 'false'},
             {iso: 'KM', name: 'Comoros', active: 'false'},
             {iso: 'CG', name: 'Congo', active: 'false'},
             {iso: 'CD', name: 'Congo, the Democratic Republic of the', active: 'false'},
             {iso: 'CK', name: 'Cook Islands', active: 'false'},
             {iso: 'CR', name: 'Costa Rica', active: 'false'},
             {iso: 'CI', name: 'Côte d\'Ivoire', active: 'false'},
             {iso: 'HR', name: 'Croatia', active: 'false'},
             {iso: 'CU', name: 'Cuba', active: 'false'},
             {iso: 'CW', name: 'Curaçao', active: 'false'},
             {iso: 'CY', name: 'Cyprus', active: 'false'},
             {iso: 'CZ', name: 'Czech Republic', active: 'false'},
             {iso: 'DK', name: 'Denmark', active: 'false'},
             {iso: 'DJ', name: 'Djibouti', active: 'false'},
             {iso: 'DM', name: 'Dominica', active: 'false'},
             {iso: 'DO', name: 'Dominican Republic', active: 'false'},
             {iso: 'EC', name: 'Ecuador', active: 'false'},
             {iso: 'EG', name: 'Egypt', active: 'false'},
             {iso: 'SV', name: 'El Salvador', active: 'false'},
             {iso: 'GQ', name: 'Equatorial Guinea', active: 'false'},
             {iso: 'ER', name: 'Eritrea', active: 'false'},
             {iso: 'EE', name: 'Estonia', active: 'false'},
             {iso: 'ET', name: 'Ethiopia', active: 'false'},
             {iso: 'FK', name: 'Falkland Islands (Malvinas)', active: 'false'},
             {iso: 'FO', name: 'Faroe Islands', active: 'false'},
             {iso: 'FJ', name: 'Fiji', active: 'false'},
             {iso: 'FI', name: 'Finland', active: 'false'},
             {iso: 'FR', name: 'France', active: 'false'},
             {iso: 'GF', name: 'French Guiana', active: 'false'},
             {iso: 'PF', name: 'French Polynesia', active: 'false'},
             {iso: 'TF', name: 'French Southern Territories', active: 'false'},
             {iso: 'GA', name: 'Gabon', active: 'false'},
             {iso: 'GM', name: 'Gambia', active: 'false'},
             {iso: 'GE', name: 'Georgia', active: 'false'},
             {iso: 'DE', name: 'Germany', active: 'false'},
             {iso: 'GH', name: 'Ghana', active: 'false'},
             {iso: 'GI', name: 'Gibraltar', active: 'false'},
             {iso: 'GR', name: 'Greece', active: 'false'},
             {iso: 'GL', name: 'Greenland', active: 'false'},
             {iso: 'GD', name: 'Grenada', active: 'false'},
             {iso: 'GP', name: 'Guadeloupe', active: 'false'},
             {iso: 'GU', name: 'Guam', active: 'false'},
             {iso: 'GT', name: 'Guatemala', active: 'false'},
             {iso: 'GG', name: 'Guernsey', active: 'false'},
             {iso: 'GN', name: 'Guinea', active: 'false'},
             {iso: 'GW', name: 'Guinea-Bissau', active: 'false'},
             {iso: 'GY', name: 'Guyana', active: 'false'},
             {iso: 'HT', name: 'Haiti', active: 'false'},
             {iso: 'HM', name: 'Heard Island and McDonald Islands', active: 'false'},
             {iso: 'VA', name: 'Holy See (Vatican City State)', active: 'false'},
             {iso: 'HN', name: 'Honduras', active: 'false'},
             {iso: 'HK', name: 'Hong Kong', active: 'false'},
             {iso: 'HU', name: 'Hungary', active: 'false'},
             {iso: 'IS', name: 'Iceland', active: 'false'},
             {iso: 'IN', name: 'India', active: 'false'},
             {iso: 'ID', name: 'Indonesia', active: 'false'},
             {iso: 'IR', name: 'Iran, Islamic Republic of', active: 'false'},
             {iso: 'IQ', name: 'Iraq', active: 'false'},
             {iso: 'IE', name: 'Ireland', active: 'false'},
             {iso: 'IM', name: 'Isle of Man', active: 'false'},
             {iso: 'IL', name: 'Israel', active: 'false'},
             {iso: 'IT', name: 'Italy', active: 'false'},
             {iso: 'JM', name: 'Jamaica', active: 'false'},
             {iso: 'JP', name: 'Japan', active: 'false'},
             {iso: 'JE', name: 'Jersey', active: 'false'},
             {iso: 'JO', name: 'Jordan', active: 'false'},
             {iso: 'KZ', name: 'Kazakhstan', active: 'false'},
             {iso: 'KE', name: 'Kenya', active: 'false'},
             {iso: 'KI', name: 'Kiribati', active: 'false'},
             {iso: 'KP', name: 'Korea, Democratic People\'s Republic of', active: 'false'},
             {iso: 'KR', name: 'Korea, Republic of', active: 'false'},
             {iso: 'KW', name: 'Kuwait', active: 'false'},
             {iso: 'KG', name: 'Kyrgyzstan', active: 'false'},
             {iso: 'LA', name: 'Lao People\'s Democratic Republic', active: 'false'},
             {iso: 'LV', name: 'Latvia', active: 'false'},
             {iso: 'LB', name: 'Lebanon', active: 'false'},
             {iso: 'LS', name: 'Lesotho', active: 'false'},
             {iso: 'LR', name: 'Liberia', active: 'false'},
             {iso: 'LY', name: 'Libya', active: 'false'},
             {iso: 'LI', name: 'Liechtenstein', active: 'false'},
             {iso: 'LT', name: 'Lithuania', active: 'false'},
             {iso: 'LU', name: 'Luxembourg', active: 'false'},
             {iso: 'MO', name: 'Macao', active: 'false'},
             {iso: 'MK', name: 'Macedonia, the former Yugoslav Republic of', active: 'false'},
             {iso: 'MG', name: 'Madagascar', active: 'false'},
             {iso: 'MW', name: 'Malawi', active: 'false'},
             {iso: 'MY', name: 'Malaysia', active: 'false'},
             {iso: 'MV', name: 'Maldives', active: 'false'},
             {iso: 'ML', name: 'Mali', active: 'false'},
             {iso: 'MT', name: 'Malta', active: 'false'},
             {iso: 'MH', name: 'Marshall Islands', active: 'false'},
             {iso: 'MQ', name: 'Martinique', active: 'false'},
             {iso: 'MR', name: 'Mauritania', active: 'false'},
             {iso: 'MU', name: 'Mauritius', active: 'false'},
             {iso: 'YT', name: 'Mayotte', active: 'false'},
             {iso: 'MX', name: 'Mexico', active: 'false'},
             {iso: 'FM', name: 'Micronesia, Federated States of', active: 'false'},
             {iso: 'MD', name: 'Moldova, Republic of', active: 'false'},
             {iso: 'MC', name: 'Monaco', active: 'false'},
             {iso: 'MN', name: 'Mongolia', active: 'false'},
             {iso: 'ME', name: 'Montenegro', active: 'false'},
             {iso: 'MS', name: 'Montserrat', active: 'false'},
             {iso: 'MA', name: 'Morocco', active: 'false'},
             {iso: 'MZ', name: 'Mozambique', active: 'false'},
             {iso: 'MM', name: 'Myanmar', active: 'false'},
             {iso: 'NA', name: 'Namibia', active: 'false'},
             {iso: 'NR', name: 'Nauru', active: 'false'},
             {iso: 'NP', name: 'Nepal', active: 'false'},
             {iso: 'NL', name: 'Netherlands[note', active: 'false'},
             {iso: 'NC', name: 'New Caledonia', active: 'false'},
             {iso: 'NZ', name: 'New Zealand', active: 'false'},
             {iso: 'NI', name: 'Nicaragua', active: 'false'},
             {iso: 'NE', name: 'Niger', active: 'false'},
             {iso: 'NG', name: 'Nigeria', active: 'false'},
             {iso: 'NU', name: 'Niue', active: 'false'},
             {iso: 'NF', name: 'Norfolk Island', active: 'false'},
             {iso: 'MP', name: 'Northern Mariana Islands', active: 'false'},
             {iso: 'NO', name: 'Norway', active: 'false'},
             {iso: 'OM', name: 'Oman', active: 'false'},
             {iso: 'PK', name: 'Pakistan', active: 'false'},
             {iso: 'PW', name: 'Palau', active: 'false'},
             {iso: 'PS', name: 'Palestine, State of', active: 'false'},
             {iso: 'PA', name: 'Panama', active: 'false'},
             {iso: 'PG', name: 'Papua New Guinea', active: 'false'},
             {iso: 'PY', name: 'Paraguay', active: 'false'},
             {iso: 'PE', name: 'Peru', active: 'false'},
             {iso: 'PH', name: 'Philippines', active: 'false'},
             {iso: 'PN', name: 'Pitcairn', active: 'false'},
             {iso: 'PL', name: 'Poland', active: 'false'},
             {iso: 'PT', name: 'Portugal', active: 'false'},
             {iso: 'PR', name: 'Puerto Rico', active: 'false'},
             {iso: 'QA', name: 'Qatar', active: 'false'},
             {iso: 'RE', name: 'Réunion', active: 'false'},
             {iso: 'RO', name: 'Romania', active: 'false'},
             {iso: 'RU', name: 'Russian Federation', active: 'true'},
             {iso: 'RW', name: 'Rwanda', active: 'false'},
             {iso: 'BL', name: 'Saint Barthélemy', active: 'false'},
             {iso: 'SH', name: 'Saint Helena, Ascension and Tristan da Cunha', active: 'false'},
             {iso: 'KN', name: 'Saint Kitts and Nevis', active: 'false'},
             {iso: 'LC', name: 'Saint Lucia', active: 'false'},
             {iso: 'MF', name: 'Saint Martin (French part)', active: 'false'},
             {iso: 'PM', name: 'Saint Pierre and Miquelon', active: 'false'},
             {iso: 'VC', name: 'Saint Vincent and the Grenadines', active: 'false'},
             {iso: 'WS', name: 'Samoa', active: 'false'},
             {iso: 'SM', name: 'San Marino', active: 'false'},
             {iso: 'ST', name: 'Sao Tome and Principe', active: 'false'},
             {iso: 'SA', name: 'Saudi Arabia', active: 'false'},
             {iso: 'SN', name: 'Senegal', active: 'false'},
             {iso: 'RS', name: 'Serbia', active: 'false'},
             {iso: 'SC', name: 'Seychelles', active: 'false'},
             {iso: 'SL', name: 'Sierra Leone', active: 'false'},
             {iso: 'SG', name: 'Singapore', active: 'false'},
             {iso: 'SX', name: 'Sint Maarten (Dutch part)', active: 'false'},
             {iso: 'SK', name: 'Slovakia', active: 'false'},
             {iso: 'SI', name: 'Slovenia', active: 'false'},
             {iso: 'SB', name: 'Solomon Islands', active: 'false'},
             {iso: 'SO', name: 'Somalia', active: 'false'},
             {iso: 'ZA', name: 'South Africa', active: 'false'},
             {iso: 'GS', name: 'South Georgia and the South Sandwich Islands', active: 'false'},
             {iso: 'SS', name: 'South Sudan', active: 'false'},
             {iso: 'ES', name: 'Spain', active: 'true'},
             {iso: 'LK', name: 'Sri Lanka', active: 'false'},
             {iso: 'SD', name: 'Sudan', active: 'false'},
             {iso: 'SR', name: 'Suriname', active: 'false'},
             {iso: 'SJ', name: 'Svalbard and Jan Mayen', active: 'false'},
             {iso: 'SZ', name: 'Swaziland', active: 'false'},
             {iso: 'SE', name: 'Sweden', active: 'false'},
             {iso: 'CH', name: 'Switzerland', active: 'false'},
             {iso: 'SY', name: 'Syrian Arab Republic', active: 'false'},
             {iso: 'TW', name: 'Taiwan, Province of China', active: 'false'},
             {iso: 'TJ', name: 'Tajikistan', active: 'false'},
             {iso: 'TZ', name: 'Tanzania, United Republic of', active: 'false'},
             {iso: 'TH', name: 'Thailand', active: 'false'},
             {iso: 'TL', name: 'Timor-Leste', active: 'false'},
             {iso: 'TG', name: 'Togo', active: 'false'},
             {iso: 'TK', name: 'Tokelau', active: 'false'},
             {iso: 'TO', name: 'Tonga', active: 'false'},
             {iso: 'TT', name: 'Trinidad and Tobago', active: 'false'},
             {iso: 'TN', name: 'Tunisia', active: 'false'},
             {iso: 'TR', name: 'Turkey', active: 'false'},
             {iso: 'TM', name: 'Turkmenistan', active: 'false'},
             {iso: 'TC', name: 'Turks and Caicos Islands', active: 'false'},
             {iso: 'TV', name: 'Tuvalu', active: 'false'},
             {iso: 'UG', name: 'Uganda', active: 'false'},
             {iso: 'UA', name: 'Ukraine', active: 'false'},
             {iso: 'AE', name: 'United Arab Emirates', active: 'false'},
             {iso: 'GB', name: 'United Kingdom', active: 'false'},
             {iso: 'US', name: 'United States', active: 'false'},
             {iso: 'UM', name: 'United States Minor Outlying Islands', active: 'false'},
             {iso: 'UY', name: 'Uruguay', active: 'false'},
             {iso: 'UZ', name: 'Uzbekistan', active: 'false'},
             {iso: 'VU', name: 'Vanuatu', active: 'false'},
             {iso: 'VE', name: 'Venezuela, Bolivarian Republic of', active: 'false'},
             {iso: 'VN', name: 'Viet Nam', active: 'false'},
             {iso: 'VG', name: 'Virgin Islands, British', active: 'false'},
             {iso: 'VI', name: 'Virgin Islands, U.S.', active: 'false'},
             {iso: 'WF', name: 'Wallis and Futuna', active: 'false'},
             {iso: 'EH', name: 'Western Sahara', active: 'false'},
             {iso: 'YE', name: 'Yemen', active: 'false'},
             {iso: 'ZM', name: 'Zambia', active: 'false'},
             {iso: 'ZW', name: 'Zimbabwe', active: 'false'}
         ];
    	
    	var getCountries = function() {
			return countries;
		};
		
		var currentCountry = countries[0];
		
		var setCountries = function(newCountries) {
			//We only update languages wether the structure is valid
			if (angular.isArray(newCountries)) {
				var isValid = true;
				var newCurrentCountryFound = false;
				var newCurrentCountryIndex;
				
				angular.forEach(newCountries, function(countryObject, key) {
					if (!countryObject.hasOwnProperty('name')
							|| !countryObject.hasOwnProperty('iso')
							|| !countryObject.hasOwnProperty('active')) { 
							isValid = false;
					}
					else if (!currentCountry) {
						newCurrentCountry = countryObject;
						currentCountry = true;
					}
				});
				
				if (isValid) {
					countries = newCountries;
					currentCountry = newCurrentCountry;
				}
			}
		};
		
		var getCurrentCountry = function() {
			return currentCountry;
		};
		
		var setCurrentCountry = function(newCurrentCountry) {
			angular.forEach(countries, function(countryObject, key) {
				if (countryObject.iso === newCurrentCountry) { 
					currentCountry = countryObject;
				}
			});
		};
    	
        return {
        	setCountries: setCountries,
        	$get : function () {
	    	    return {
	    	    	getCountries: getCountries,
	    	    	getCurrentCountry: getCurrentCountry,
	    	    	setCurrentCountry: setCurrentCountry
	    	    }
        	}
        }
    });