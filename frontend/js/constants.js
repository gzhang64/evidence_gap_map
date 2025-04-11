const countryNameMapping = {
    "Afghanistan": "Afghanistan",
    "Aland Islands": null,  // Not found in GeoJSON
    "Albania": "Albania",
    "Algeria": "Algeria",
    "American Samoa": null,  // Not found in GeoJSON
    "Andorra": null,  // Not found in GeoJSON
    "Angola": "Angola",
    "Antarctica": "Antarctica",
    "Antigua and Barbuda": null,  // Not found in GeoJSON
    "Argentina": "Argentina",
    "Armenia": "Armenia",
    "Aruba": null,  // Not found in GeoJSON
    "Australia": "Australia",
    "Austria": "Austria",
    "Azerbaijan": "Azerbaijan",
    "Bahamas": "The Bahamas",
    "Bahrain": null,  // Not found in GeoJSON
    "Bangladesh": "Bangladesh",
    "Barbados": null,  // Not found in GeoJSON
    "Belarus": "Belarus",
    "Belgium": "Belgium",
    "Belize": "Belize",
    "Benin": "Benin",
    "Bermuda": null,  // Not found in GeoJSON
    "Bhutan": "Bhutan",
    "Bolivia": "Bolivia",
    "Bonaire, Sint Eustatius and Saba": null,  // Not found in GeoJSON
    "Bosnia and Herzegovina": "Bosnia and Herzegovina",
    "Botswana": "Botswana",
    "Brazil": "Brazil",
    "Brunei Darussalam": "Brunei",
    "Bulgaria": "Bulgaria",
    "Burkina Faso": "Burkina Faso",
    "Burundi": "Burundi",
    "Cambodia": "Cambodia",
    "Cameroon": "Cameroon",
    "Canada": "Canada",
    "Cape Verde": null,  // Not found in GeoJSON
    "Cayman Islands": null,  // Not found in GeoJSON
    "Central African Republic": "Central African Republic",
    "Chad": "Chad",
    "Chile": "Chile",
    "China": "China",
    "Colombia": "Colombia",
    "Comoros": null,  // Not found in GeoJSON
    "Congo": "Republic of the Congo",
    "Congo, The Democratic Republic of the": "Democratic Republic of the Congo",
    "Costa Rica": "Costa Rica",
    "Croatia": "Croatia",
    "Cuba": "Cuba",
    "Cyprus": "Cyprus",
    "Czech Republic": "Czech Republic",
    "Czechia": "Czech Republic",
    "Côte D'Ivoire": "Ivory Coast",
    "Denmark": "Denmark",
    "Djibouti": "Djibouti",
    "Dominica": null,  // Not found in GeoJSON
    "Dominican Republic": "Dominican Republic",
    "Ecuador": "Ecuador",
    "Egypt": "Egypt",
    "El Salvador": "El Salvador",
    "Equatorial Guinea": "Equatorial Guinea",
    "Eritrea": "Eritrea",
    "Estonia": "Estonia",
    "Ethiopia": "Ethiopia",
    "Faroe Islands": null,  // Not found in GeoJSON
    "Federated States of Micronesia": null,  // Not found in GeoJSON
    "Fiji": "Fiji",
    "Finland": "Finland",
    "Former Serbia and Montenegro": null,  // No direct equivalent, use Serbia
    "Former Yugoslavia": null,  // No direct equivalent, split into various countries
    "France": "France",
    "French Guiana": "French Guiana",
    "French Polynesia": null,  // Not found in GeoJSON
    "Gabon": "Gabon",
    "Gambia": "Gambia",
    "Georgia": "Georgia",
    "Germany": "Germany",
    "Ghana": "Ghana",
    "Gibraltar": null,  // Not found in GeoJSON
    "Greece": "Greece",
    "Greenland": "Greenland",
    "Grenada": null,  // Not found in GeoJSON
    "Guadeloupe": null,  // Not found in GeoJSON
    "Guam": null,  // Not found in GeoJSON
    "Guatemala": "Guatemala",
    "Guinea": "Guinea",
    "Guinea-Bissau": "Guinea Bissau",
    "Guyana": "Guyana",
    "Haiti": "Haiti",
    "Holy See (Vatican City State)": null,  // Not found in GeoJSON
    "Honduras": "Honduras",
    "Hong Kong": null,  // Not found in GeoJSON
    "Hungary": "Hungary",
    "Iceland": "Iceland",
    "India": "India",
    "Indonesia": "Indonesia",
    "Iran, Islamic Republic of": "Iran",
    "Iraq": "Iraq",
    "Ireland": "Ireland",
    "Israel": "Israel",
    "Italy": "Italy",
    "Jamaica": "Jamaica",
    "Japan": "Japan",
    "Jersey": null,  // Not found in GeoJSON
    "Jordan": "Jordan",
    "Kazakhstan": "Kazakhstan",
    "Kenya": "Kenya",
    "Kiribati": null,  // Not found in GeoJSON
    "Korea, Republic of": "South Korea",
    "Kosovo": "Kosovo",
    "Kuwait": "Kuwait",
    "Kyrgyzstan": "Kyrgyzstan",
    "Lao People's Democratic Republic": "Laos",
    "Latvia": "Latvia",
    "Lebanon": "Lebanon",
    "Lesotho": "Lesotho",
    "Liberia": "Liberia",
    "Libyan Arab Jamahiriya": "Libya",
    "Liechtenstein": null,  // Not found in GeoJSON
    "Lithuania": "Lithuania",
    "Luxembourg": "Luxembourg",
    "Macau": null,  // Not found in GeoJSON
    "Macedonia, The Former Yugoslav Republic of": "Macedonia",
    "Madagascar": "Madagascar",
    "Malawi": "Malawi",
    "Malaysia": "Malaysia",
    "Maldives": null,  // Not found in GeoJSON
    "Mali": "Mali",
    "Malta": "Malta",
    "Martinique": null,  // Not found in GeoJSON
    "Mauritania": "Mauritania",
    "Mauritius": null,  // Not found in GeoJSON
    "Mayotte": null,  // Not found in GeoJSON
    "Mexico": "Mexico",
    "Moldova, Republic of": "Moldova",
    "Monaco": null,  // Not found in GeoJSON
    "Mongolia": "Mongolia",
    "Montenegro": "Montenegro",
    "Montserrat": null,  // Not found in GeoJSON
    "Morocco": "Morocco",
    "Mozambique": "Mozambique",
    "Myanmar": "Myanmar",
    "Namibia": "Namibia",
    "Nauru": null,  // Not found in GeoJSON
    "Nepal": "Nepal",
    "Netherlands": "Netherlands",
    "Netherlands Antilles": null,  // No longer exists as a separate entity
    "New Caledonia": "New Caledonia",
    "New Zealand": "New Zealand",
    "Nicaragua": "Nicaragua",
    "Niger": "Niger",
    "Nigeria": "Nigeria",
    "Niue": null,  // Not found in GeoJSON
    "North Macedonia": "Macedonia",
    "Northern Mariana Islands": null,  // Not found in GeoJSON
    "Norway": "Norway",
    "Oman": "Oman",
    "Pakistan": "Pakistan",
    "Palau": null,  // Not found in GeoJSON
    "Palestinian Territories, Occupied": "West Bank",
    "Palestinian Territory, occupied": "West Bank",
    "Panama": "Panama",
    "Papua New Guinea": "Papua New Guinea",
    "Paraguay": "Paraguay",
    "Peru": "Peru",
    "Philippines": "Philippines",
    "Poland": "Poland",
    "Portugal": "Portugal",
    "Puerto Rico": "Puerto Rico",
    "Qatar": "Qatar",
    "Romania": "Romania",
    "Russian Federation": "Russia",
    "Rwanda": "Rwanda",
    "Réunion": null,  // Not found in GeoJSON
    "Saint Kitts and Nevis": null,  // Not found in GeoJSON
    "Saint Lucia": null,  // Not found in GeoJSON
    "Saint Martin": null,  // Not found in GeoJSON
    "Saint Vincent and the Grenadines": null,  // Not found in GeoJSON
    "Samoa": "Samoa",
    "San Marino": null,  // Not found in GeoJSON
    "Saudi Arabia": "Saudi Arabia",
    "Senegal": "Senegal",
    "Serbia": "Republic of Serbia",
    "Seychelles": null,  // Not found in GeoJSON
    "Sierra Leone": "Sierra Leone",
    "Singapore": null,  // Not found in GeoJSON
    "Slovakia": "Slovakia",
    "Slovenia": "Slovenia",
    "Solomon Islands": "Solomon Islands",
    "Somalia": "Somalia",
    "South Africa": "South Africa",
    "South Georgia and the South Sandwich Islands": null,  // Not found in GeoJSON
    "South Sudan": "South Sudan",
    "Spain": "Spain",
    "Sri Lanka": "Sri Lanka",
    "Sudan": "Sudan",
    "Suriname": "Suriname",
    "Swaziland": "Swaziland",
    "Sweden": "Sweden",
    "Switzerland": "Switzerland",
    "Syrian Arab Republic": "Syria",
    "Taiwan": "Taiwan",
    "Tajikistan": "Tajikistan",
    "Tanzania": "United Republic of Tanzania",
    "Thailand": "Thailand",
    "The Democratic Republic of the Congo": "Democratic Republic of the Congo",
    "Timor-Leste": "East Timor",
    "Togo": "Togo",
    "Trinidad and Tobago": "Trinidad and Tobago",
    "Tunisia": "Tunisia",
    "Turkey": "Turkey",
    "Uganda": "Uganda",
    "Ukraine": "Ukraine",
    "United Arab Emirates": "United Arab Emirates",
    "United Kingdom": "United Kingdom",
    "United States": "United States of America",
    "United States Minor Outlying Islands": "United States of America",  // Not found in GeoJSON
    "Uruguay": "Uruguay",
    "Uzbekistan": "Uzbekistan",
    "Vanuatu": "Vanuatu",
    "Venezuela": "Venezuela",
    "Vietnam": "Vietnam",
    "Virgin Islands (U.S.)": "United States of America",  // Not found in GeoJSON
    "Yemen": "Yemen",
    "Zambia": "Zambia",
    "Zimbabwe": "Zimbabwe",
    // Add other mappings as needed 
};