let conditions = []; // Empty array to store conditions from CSV
let selectedGroups = [[]]; // Array to store groups of conditions
let matchedTrials = [];
let population_country = {};  // Object to store nct_id and country data
const RESULTS_PER_PAGE = 10;
let currentPage = 1;
let paginatedData = [];
let trial_collection = [];

// Function to fetch all trials data from REST API and log it with timing
async function loadTrialsData() {
    console.time("Data Load Time"); // Start timing

    try {
        const response = await fetch('http://127.0.0.1:5000/api/trials');
        if (!response.ok) throw new Error('Failed to load data from API');

        const trial_collection = await response.json();
        console.log("Fetched trials data:", trial_collection.length); // Log the fetched data
        matchedTrials = trial_collection;

    } catch (error) {
        console.error("Error loading data from API:", error);
    } finally {
        console.timeEnd("Data Load Time"); // End timing and log the duration
    }
}

async function loadConditionsFromAPI() {
    console.time("Conditions Load Time"); // Start timing
    try {
        const response = await fetch('http://127.0.0.1:5000/api/conditions');
        if (!response.ok) throw new Error("Failed to load conditions from API");

        conditions = await response.json();
        console.log("Fetched conditions:", conditions.length); // Log the fetched conditions
    } catch (error) {
        console.error("Error loading conditions from API:", error);
    } finally {
        console.timeEnd("Conditions Load Time"); // End timing and log the duration
    }
}

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

// Function to show autocomplete suggestions
function showSuggestions(input) {
    const container = document.getElementById('autocompleteContainer');
    container.innerHTML = ''; // Clear previous suggestions
    if (!input) return; // If no input, exit

    const suggestions = conditions.filter(condition =>
        condition.toLowerCase().startsWith(input.toLowerCase())
    );

    suggestions.forEach(suggestion => {
        const div = document.createElement('div');
        div.classList.add('autocomplete-item');
        div.innerText = suggestion;
        div.onclick = () => addCondition(suggestion);
        container.appendChild(div);
    });
}

// Add condition from search bar
function addCondition(condition) {
    const groupLogic = document.getElementById('groupLogicDropdown').value;

    if (groupLogic === 'AND') {
        selectedGroups[selectedGroups.length - 1].push(condition);
    } else {
        selectedGroups.push([condition]);
    }
    updateSelectedConditions();
    document.getElementById('searchInput').value = ''; // Clear input
    document.getElementById('autocompleteContainer').innerHTML = ''; // Clear suggestions
}

// Function to update the display of selected conditions and query visualization
function updateSelectedConditions() {
    const selectedContainer = document.getElementById('selectedConditions');
    selectedContainer.innerHTML = ''; // Clear previous display

    // Create a visual representation of conditions in groups
    selectedGroups.forEach(group => {
        const groupDiv = document.createElement('div');
        groupDiv.classList.add('condition-group');
        
        group.forEach(condition => {
            const chip = document.createElement('div');
            chip.classList.add('condition-chip');
            chip.innerHTML = `${condition} <span class="remove-chip" onclick="removeCondition('${condition}')">x</span>`;
            groupDiv.appendChild(chip);
        });

        selectedContainer.appendChild(groupDiv);
    });

    // Update the query visualization only if there are selected conditions
    const queryVisualization = document.getElementById('queryVisualization');
    const groupQueries = selectedGroups.map(group => group.join(' AND '));
    const searchQuery = groupQueries.join(' OR ');

    // Show the query visualization only if there are conditions selected
    if (searchQuery) {
        queryVisualization.innerHTML = `Current query: ${searchQuery}`;
        queryVisualization.style.display = 'block'; // Make query visible
        document.getElementById('report-export-button').style.display = 'block'
    } else {
        queryVisualization.innerHTML = '';
        queryVisualization.style.display = 'none'; // Hide query if no conditions
        document.getElementById('report-export-button').style.display = 'none'
    }
}

async function submitSearch() {
    const hasSelectedConditions = selectedGroups.some(group => group.length > 0);
    const searchResultsContainer = document.querySelector('.trial-details-column');
    const visualizationContainer = document.querySelector('.visualizations-column');

    if (!hasSelectedConditions) {
        // Hide containers if no conditions are selected
        searchResultsContainer.style.display = 'none';
        visualizationContainer.style.display = 'none';
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/api/search_trials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selectedGroups })
        });
        if (!response.ok) throw new Error("Failed to fetch matching trials");

        matchedTrials = await response.json();
        console.log("Matched Trials:", matchedTrials);

        // Update paginatedData and initialize pagination
        paginatedData = matchedTrials;
        currentPage = 1;  // Reset to the first page
        displayPage(currentPage);
        createPaginationControls();

        // Show the search results and visualization sections
        searchResultsContainer.style.display = 'block';
        visualizationContainer.style.display = 'block';

        // Update other visualizations (map, charts)
        const countryTrialCount = countTrialsByCountry(matchedTrials);
        drawChoroplethMap(countryTrialCount);
        const count_by_year = matchedTrials.map(trial=>trial.time)
            .reduce((acc, curr) => {
            acc[curr] = (acc[curr] || 0) + 1;
            return acc;
          }, {});
        const array = Object.keys(count_by_year).map(key=>({
            year: key,
            value: "V1", // not used for noe
            records: count_by_year[key]
            })
        )
        trend_plot(array, "trend-geographical")

        const { minAgeCount, maxAgeCount } = countMinAndMaxAges(matchedTrials);
        createAgeBarChart(minAgeCount, '#bar-chart-min-age', 'Minimum Age');
        const x = matchedTrials.reduce((acc, trial) => {
            const year = trial.time
            // use the same normalization as the other age plots
            const age = normalizeAgeToBin(trial.pico_attributes.populations.minimum_age || "NA");
            if(!acc[year]) {
                acc[year] = {value: age, records: 1}
            } else {
                if(!acc[year][age]) {
                    acc[year][age] = 1
                } else {
                    acc[year][age]++
                }
            }
            return acc;
          }, {});
        const min_age_array = []
        for(const year in x) {
            const values = x[year]
            for(const age in values) {
                min_age_array.push({
                    year: year,
                    value: age,
                    records: +values[age]})
            }
        }
        trend_plot(min_age_array, "trend-min-age")
        createAgeBarChart(maxAgeCount, '#bar-chart-max-age', 'Maximum Age');

        const genderCount = countGenderDistribution(matchedTrials);
        const genderData = Object.entries(genderCount).map(([gender, count]) => ({
            gender,
            count
        }));
        drawGenderDistributionDonutChart(genderData, '#gender-donut-chart');

        // Count intervention types and render the intervention type donut chart
        const interventionCount = countInterventionTypes(matchedTrials);
        const interventionData = Object.entries(interventionCount).map(([intervention, count]) => ({
            intervention,
            count
        }));
        drawInterventionTypeDonutChart(interventionData, '#intervention-pie-chart');

        const top20Interventions = getTop20Interventions(matchedTrials);
        drawTop20InterventionsBarChart(top20Interventions, '#top20-interventions-bar-chart');

        const top20Outcomes = getTop20Outcomes(matchedTrials);
        drawTop20OutcomesBarChart(top20Outcomes, '#top20-outcomes-bar-chart');

    } catch (error) {
        console.error("Error in submitSearch:", error);
    }
}


// Function to update search results with matchedTrials
function updateSearchResults(matchedTrials) {
    const searchResultsContainer = document.getElementById("searchResults");
    searchResultsContainer.innerHTML = ""; // Clear previous results

    if (matchedTrials.length === 0) {
        searchResultsContainer.style.display = 'none';
        return;
    }

    searchResultsContainer.style.display = 'block';

    matchedTrials.forEach(trial => {
        const trialDiv = document.createElement("div");
        trialDiv.classList.add("search-entry");

        // Format trial details
        const title = trial.title || "Untitled Trial";
        const nctId = trial.nct_id || "N/A";
        const conditions = trial.conditions && trial.conditions.length > 0 ? trial.conditions.join(", ") : "No conditions specified";
        const conditionConcepts = trial.condition_concepts && trial.condition_concepts.length > 0 ?
            trial.condition_concepts.join(", ") : "No condition concepts specified";

        
        const ageRange = `${trial.pico_attributes.populations.minimum_age || "N/A"} - ${trial.pico_attributes.populations.maximum_age || "N/A"}`;
        const country = trial.pico_attributes.populations.country || "N/A";
        const gender = trial.pico_attributes.populations.gender || "N/A";

        const interventions = trial.pico_attributes.interventions && trial.pico_attributes.interventions.length > 0 ? 
            trial.pico_attributes.interventions.join(", ") : "No interventions specified";

        const outcomes = trial.pico_attributes.outcomes && trial.pico_attributes.outcomes.length > 0 ? 
            trial.pico_attributes.outcomes.join(", ") : "No outcomes specified";

        // New fields for intervention types, concepts, and outcome/condition concepts
        const interventionTypes = trial.pico_attributes.intervention_types && trial.pico_attributes.intervention_types.length > 0 ?
            trial.pico_attributes.intervention_types.join(", ") : "No intervention types specified";
        
        const interventionConcepts = trial.pico_attributes.intervention_concepts && trial.pico_attributes.intervention_concepts.length > 0 ?
            trial.pico_attributes.intervention_concepts.join(", ") : "No intervention concepts specified";

        const outcomeConcepts = trial.pico_attributes.outcome_concepts && trial.pico_attributes.outcome_concepts.length > 0 ?
            trial.pico_attributes.outcome_concepts.join(", ") : "No outcome concepts specified";

        // Structure the HTML to include new fields
        trialDiv.innerHTML = `
            <h4>${title}</h4>
            <p><strong>NCT ID:</strong> ${nctId}</p>
            <p><strong>Conditions:</strong> ${conditions}</p>
            <p><strong>Condition Concepts:</strong> ${conditionConcepts}</p>
            <p><strong>Population:</strong></p>
            <ul>
                <li><strong>Age Range:</strong> ${ageRange}</li>
                <li><strong>Country:</strong> ${country}</li>
                <li><strong>Gender:</strong> ${gender}</li>
            </ul>
            <p><strong>Interventions:</strong> ${interventions}</p>
            <p><strong>Intervention Types:</strong> ${interventionTypes}</p>
            <p><strong>Intervention Concepts:</strong> ${interventionConcepts}</p>
            <p><strong>Outcomes:</strong> ${outcomes}</p>
            <p><strong>Outcome Concepts:</strong> ${outcomeConcepts}</p>
            
        `;

        searchResultsContainer.appendChild(trialDiv);
    });
}


// Remove condition from the selected list
function removeCondition(condition) {
    selectedGroups = selectedGroups.map(group =>
        group.filter(item => item !== condition)
    ).filter(group => group.length > 0);
    updateSelectedConditions();
}

// Clear all selected conditions
function clearConditions() {
    selectedGroups = [[]];
    updateSelectedConditions();
}

// Function to show the selected section and hide the others
function showSection(sectionId) {
    var sections = document.querySelectorAll('section');
    sections.forEach(function(section) {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// Function to normalize the country names based on the mapping
function normalizeCountryName(country) {
    // Return the mapped name or the original if no mapping exists
    return countryNameMapping[country] || country;  }

// Function to count trials by country from matchedTrials
function countTrialsByCountry(matchedTrials) {
    let countryTrialCount = {};

    matchedTrials.forEach(trial => {
        const country = trial.pico_attributes.populations.country;
        const normalizedCountry = normalizeCountryName(country);
        if (normalizedCountry) {
            countryTrialCount[normalizedCountry] = (countryTrialCount[normalizedCountry] || 0) + 1;
        }
    });

    console.log("Trial count by country:", countryTrialCount);
    return countryTrialCount;
}


// Function to draw the choropleth map with Europe on the left
function drawChoroplethMap(countryTrialCount) {
    const width = 300;
    const height = 150;

    const svg = d3.select("#map")
        .attr("width", width)
        .attr("height", height);

    // Adjust the projection to rotate the globe
    const projection = d3.geoNaturalEarth1()
        .scale(55)
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    const colorScale = d3.scaleLog()
        .domain([1, d3.max(Object.values(countryTrialCount))])
        .range(["#99d1ff", "#003366"]);

    const tooltip = d3.select("#tooltip");

    d3.json('data/population/countries.geo.json').then(function(geoData) {
        svg.selectAll("path")
            .data(geoData.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", d => {
                const countryName = d.properties.name;
                const trials = countryTrialCount[countryName] || 0;
                return colorScale(trials + 1);
            })
            .attr("stroke", "#fff")
            .attr("stroke-width", 0.5)
            .on("mouseover", function(event, d) {
                const countryName = d.properties.name;
                const trials = countryTrialCount[countryName] || 0;
                tooltip.style("display", "block")
                    .html(`${countryName}: ${trials} trials`);
            })
            .on("mousemove", function(event) {
                tooltip.style("top", (event.pageY + 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("display", "none");
            });
    }).catch(function(error) {
        console.error("Error loading GeoJSON:", error);
    });
}

// Tooltip functions (optional)
function showTooltip(event, text) {
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "solid 1px #ccc")
        .style("padding", "5px")
        .style("pointer-events", "none")
        .style("top", `${event.pageY + 5}px`)
        .style("left", `${event.pageX + 5}px`)
        .text(text);
}

function hideTooltip() {
    d3.selectAll(".tooltip").remove();
}

// Helper function to normalize ages into predefined bins
function normalizeAgeToBin(age) {
    if (age === "NA") return "NA";
    const ageInYears = parseInt(age);

    if (isNaN(ageInYears)) return "NA";  // Handle any non-numeric cases
    if (ageInYears < 1) return "< 1 yr";
    if (ageInYears < 10) return "under 10 yr";
    if (ageInYears < 20) return "10 - 20 yr";
    if (ageInYears < 30) return "20 - 30 yr";
    if (ageInYears < 40) return "30 - 40 yr";
    if (ageInYears < 50) return "40 - 50 yr";
    if (ageInYears < 60) return "50 - 60 yr";
    if (ageInYears < 70) return "60 - 70 yr";
    if (ageInYears < 80) return "70 - 80 yr";
    return "over 80 yr";
}

// Function to count minimum and maximum ages from matchedTrials, with all bins initialized
function countMinAndMaxAges(matchedTrials) {
    const ageBins = [
        "< 1 yr", "under 10 yr", "10 - 20 yr", "20 - 30 yr", "30 - 40 yr",
        "40 - 50 yr", "50 - 60 yr", "60 - 70 yr", "70 - 80 yr",
        "over 80 yr", "NA"
    ];

    // Initialize all bins to zero
    const minAgeCount = {};
    const maxAgeCount = {};
    ageBins.forEach(bin => {
        minAgeCount[bin] = 0;
        maxAgeCount[bin] = 0;
    });

    // Populate bins based on matched trials
    matchedTrials.forEach(trial => {
        const minAgeBin = normalizeAgeToBin(trial.pico_attributes.populations.minimum_age || "NA");
        const maxAgeBin = normalizeAgeToBin(trial.pico_attributes.populations.maximum_age || "NA");

        minAgeCount[minAgeBin] += 1;
        maxAgeCount[maxAgeBin] += 1;
    });

    return { minAgeCount, maxAgeCount };
}


// Function to create a bar chart for age distribution
function createAgeBarChart(data, chartID, title) {
    const container = document.querySelector(chartID);
    const containerWidth = container.offsetWidth;

    // Set up margin and dimensions
    const margin = { top: 20, right: 10, bottom: 60, left: 40 };
    const width = Math.max(containerWidth - margin.left - margin.right, 300);
    const height = Math.max(width * 0.6, 200);

    // Clear previous SVG content
    d3.select(chartID).html("");

    // Determine the maximum count for scaling
    const maxY = Math.max(...Object.values(data));

    // Sort data by bin keys to maintain order
    const binOrder = [
        "< 1 yr ", "under 10 yr", "10 - 20 yr", "20 - 30 yr", "30 - 40 yr", 
        "40 - 50 yr", "50 - 60 yr", "60 - 70 yr", "70 - 80 yr", 
        "over 80 yr", "NA"
    ];
    const sortedData = Object.entries(data).sort((a, b) => {
        return binOrder.indexOf(a[0]) - binOrder.indexOf(b[0]);
    });

    // Create SVG with full width and height, including margins
    const svg = d3.select(chartID)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    // Create a <g> element with the appropriate translation for margins
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define scales with dynamic width
    const x = d3.scaleBand()
        .domain(sortedData.map(d => d[0]))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, maxY])
        .range([height, 0]);

    // Draw x-axis and y-axis with correct scales
    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickSize(0))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-0.5em")
        .attr("dy", "0.15em")
        .attr("transform", "rotate(-45)");

    g.append("g")
        .call(d3.axisLeft(y).ticks(5));

    // Tooltip setup
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("padding", "5px")
        .style("background", "rgba(0, 0, 0, 0.7)")
        .style("color", "#fff")
        .style("border-radius", "3px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    // Draw bars with sorted data, adding hover interaction for tooltip
    g.selectAll(".bar")
        .data(sortedData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d[0]))
        .attr("y", d => y(d[1]))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d[1]))
        .attr("fill", "#2d64a8")
        .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1)
                   .html(`${d[1]}`)
                   .style("left", `${event.pageX + 10}px`)
                   .style("top", `${event.pageY - 20}px`);
        })
        .on("mousemove", (event) => {
            tooltip.style("left", `${event.pageX + 10}px`)
                   .style("top", `${event.pageY - 20}px`);
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
        });

    // Add a centered, responsive title
    svg.append("text")
        .attr("x", (width + margin.left + margin.right) / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text(title);
}

// Function to count intervention types from matchedTrials
function countInterventionTypes(matchedTrials) {
    const interventionCount = {};

    matchedTrials.forEach(trial => {
        const intervention_types = trial.pico_attributes.intervention_types || [];
        intervention_types.forEach(intervention_type => {
            interventionCount[intervention_type] = (interventionCount[intervention_type] || 0) + 1;
        });
    });

    console.log("Intervention types: ", interventionCount);

    return interventionCount;
}

// Function to draw a donut chart for intervention types with a legend and hover tooltip
function drawInterventionTypeDonutChart(data, chartID) {
    const width = 300;
    const height = 225;
    const margin = 10;
    const legendWidth = 75;
    const radius = Math.min(width - legendWidth, height) / 2 - margin;

    // Clear previous chart content
    d3.select(chartID).html("");

    const svg = d3.select(chartID)
        .append("svg")
        .attr("width", width + legendWidth)
        .attr("height", height)
        .style("display", "block")
        .style("margin", "0 auto")
        .append("g")
        .attr("transform", `translate(${(width - legendWidth) / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.intervention))
        .range(d3.schemeCategory10);

    const pie = d3.pie().value(d => d.count);
    const arc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius * 0.9);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "#f9f9f9")
        .style("border", "1px solid #ccc")
        .style("padding", "5px")
        .style("display", "none");

    svg.selectAll('slices')
        .data(pie(data))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.intervention))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .on("mouseover", function(event, d) {
            tooltip.style("display", "block").html(`${d.data.intervention}: ${d.data.count}`);
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("display", "none");
        });

    const legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${radius + margin}, ${-height / 2 + i * 20})`);

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", color);

    legend.append("text")
        .attr("x", 12)
        .attr("y", 4)
        .attr("dy", "0.35em")
        .style("text-anchor", "start")
        .style("font-size", "8px")
        .text(d => d);
}


// Helper function to normalize gender values
function normalizeGender(gender) {
    if (!gender) return "NA";
    const upperGender = gender.toUpperCase();

    if (upperGender.includes("FEMALE")) return "FEMALE";
    if (upperGender.includes("MALE")) return "MALE";
    if (upperGender === "ALL") return "ALL";
    return "NA";  // For any unrecognized or missing values
}

// Function to count gender distribution from matchedTrials with normalized genders
function countGenderDistribution(matchedTrials) {
    const genderCount = {
        "MALE": 0,
        "FEMALE": 0,
        "ALL": 0,
        "NA": 0
    };

    matchedTrials.forEach(trial => {
        const gender = normalizeGender(trial.pico_attributes.populations.gender);
        genderCount[gender] = (genderCount[gender] || 0) + 1;
    });

    return genderCount;
}


// Function to draw a donut chart for gender distribution with a legend and hover tooltip
function drawGenderDistributionDonutChart(data, chartID) {
    const width = 300;  // Increase width to accommodate legend
    const height = 225;
    const margin = 10;
    const legendWidth = 50;  // Space for the legend

    const radius = Math.min(width - legendWidth, height) / 2 - margin;

    // Clear previous chart content
    d3.select(chartID).html("");

    // Create SVG and center the chart on the page
    const svg = d3.select(chartID)
        .append("svg")
        .attr("width", width + legendWidth)
        .attr("height", height)
        .style("display", "block")  // Center the SVG on the page
        .style("margin", "0 auto")
        .append("g")
        .attr("transform", `translate(${(width - legendWidth) / 2}, ${height / 2})`);

    // Create the color scale
    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.gender))
        .range(d3.schemeCategory10);

    // Compute the position of each group on the pie
    const pie = d3.pie()
        .value(d => d.count);

    // Generate the arcs
    const arc = d3.arc()
        .innerRadius(radius * 0.5) // Donut chart inner radius
        .outerRadius(radius * 0.9);

    // Tooltip div for showing value on hover
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "#f9f9f9")
        .style("border", "1px solid #ccc")
        .style("padding", "5px")
        .style("display", "none");

    // Create the arcs for each slice
    svg.selectAll('slices')
        .data(pie(data))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.gender))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .on("mouseover", function(event, d) {
            tooltip.style("display", "block")
                .html(`${d.data.gender}: ${d.data.count}`);
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("display", "none");
        });

    // Add a legend on the right
    const legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${radius + margin}, ${-height / 2 + i * 20})`);

    // Add colored squares to the legend
    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", color);

    // Add text to the legend
    legend.append("text")
        .attr("x", 12)
        .attr("y", 4)
        .attr("dy", "0.35em")
        .style("text-anchor", "start")
        .style("font-size", "8px")
        .text(d => d);
}

// Function to get the top 20 interventions from matchedTrials
function getTop20Interventions(matchedTrials) {
    const interventionCount = {};

    // Count occurrences of each intervention
    matchedTrials.forEach(trial => {
        const interventions = trial.pico_attributes.intervention_concepts || [];
        interventions.forEach(intervention => {
            interventionCount[intervention] = (interventionCount[intervention] || 0) + 1;
        });
    });

    // Convert to array, sort by count, and get the top 20 interventions
    const sortedInterventions = Object.entries(interventionCount)
        .map(([intervention, count]) => ({ intervention, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

    return sortedInterventions;
}

// Function to draw a horizontal bar chart for the top 20 interventions
function drawTop20InterventionsBarChart(data, chartID) {
    const margin = { top: 20, right: 0, bottom: 20, left: 150 };
    const width = 300 - margin.left - margin.right;
    const height = 225 - margin.top - margin.bottom;

    // Clear previous chart content
    d3.select(chartID).html("");

    // Create SVG
    const svg = d3.select(chartID)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .range([0, width]);

    const maxCount = d3.max(data, d => d.count);
    const tickValues = d3.range(0, maxCount, 500);

    // Y scale (use the intervention names as categories)
    const y = d3.scaleBand()
        .domain(data.map(d => d.intervention))
        .range([0, height])
        .padding(0.1);

    // X axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickValues(tickValues))
        .selectAll("text")  // Select all y-axis labels
        .style("font-size", "6px");

    // Y axis
    svg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")  // Select all y-axis labels
        .style("font-size", "6px");

    // Tooltip div for showing value on hover
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "#f9f9f9")
        .style("border", "1px solid #ccc")
        .style("padding", "5px")
        .style("display", "none");

    // Bars
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", d => y(d.intervention))
        .attr("width", d => x(d.count))
        .attr("height", y.bandwidth())
        .attr("fill", "#2d64a8")
        .on("mouseover", function(event, d) {
            tooltip.style("display", "block")
                .html(`${d.intervention}: ${d.count}`);
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("display", "none");
        });
}

// Function to get the top 20 outcomes from matchedTrials
function getTop20Outcomes(matchedTrials) {
    const outcomeCount = {};

    // Count occurrences of each outcome
    matchedTrials.forEach(trial => {
        const outcomes = trial.pico_attributes.outcome_concepts || [];
        outcomes.forEach(outcome => {
            outcomeCount[outcome] = (outcomeCount[outcome] || 0) + 1;
        });
    });

    // Convert to array, sort by count, and get the top 20 outcomes
    const sortedOutcomes = Object.entries(outcomeCount)
        .map(([outcome, count]) => ({ outcome, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

    return sortedOutcomes;
}

// Function to draw a horizontal bar chart for the top 20 outcomes
function drawTop20OutcomesBarChart(data, chartID) {
    const margin = { top: 20, right: 0, bottom: 20, left: 150 };
    const width = 300 - margin.left - margin.right;
    const height = 225 - margin.top - margin.bottom;

    // Clear previous chart content
    d3.select(chartID).html("");

    // Create SVG
    const svg = d3.select(chartID)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .range([0, width]);

    const maxCount = d3.max(data, d => d.count);
    const tickValues = d3.range(0, maxCount, 500);
    

    // Y scale (use the outcome names as categories)
    const y = d3.scaleBand()
        .domain(data.map(d => d.outcome))
        .range([0, height])
        .padding(0.1);

    // X axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickValues(tickValues))
        .selectAll("text")  // Select all y-axis labels
        .style("font-size", "6px");

    // Y axis
    svg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")  // Select all y-axis labels
        .style("font-size", "6px");

    // Tooltip div for showing value on hover
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "#f9f9f9")
        .style("border", "1px solid #ccc")
        .style("padding", "5px")
        .style("display", "none");

    // Bars
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", d => y(d.outcome))
        .attr("width", d => x(d.count))
        .attr("height", y.bandwidth())
        .attr("fill", "#2d64a8")
        .on("mouseover", function(event, d) {
            tooltip.style("display", "block")
                .html(`${d.outcome}: ${d.count}`);
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("display", "none");
        });
}

function displayPage(page) {
    const start = (page - 1) * RESULTS_PER_PAGE;
    const end = start + RESULTS_PER_PAGE;
    const pageData = paginatedData.slice(start, end);

    const searchResultsDiv = document.getElementById("searchResults");
    searchResultsDiv.innerHTML = ""; // Clear previous results

    if (pageData.length === 0) {
        searchResultsDiv.style.display = 'none'; // Hide if no data
    } else {
        searchResultsDiv.style.display = 'block'; // Show if data is present

        pageData.forEach(entry => {
            const populations = entry.pico_attributes.populations;
            const populationDetails = `
                Age Range: ${populations.minimum_age || "NA"} - ${populations.maximum_age || "NA"}<br>
                Country: ${populations.country || "NA"}<br>
                Gender: ${populations.gender || "NA"}
            `;

            const entryDiv = document.createElement("div");
            entryDiv.classList.add("search-entry");
            
            entryDiv.innerHTML = `
                <h4>${entry.title || "Untitled Entry"}</h4> <!-- Display the title field -->
                <p><strong>NCT ID:</strong> ${entry.nct_id || "NA"}</p>
                <p><strong>Conditions:</strong> ${entry.conditions ? entry.conditions.join(", ") : "Not specified"}</p>
                <p><strong>Population:</strong><br> ${populationDetails}</p>
                <p><strong>Interventions:</strong> ${entry.pico_attributes.interventions ? entry.pico_attributes.interventions.join(", ") : "Not specified"}</p>
                <p><strong>Intervention types:</strong> ${entry.pico_attributes.intervention_types ? entry.pico_attributes.intervention_types.join(", ") : "Not specified"}</p>
                <p><strong>Outcomes:</strong> ${entry.pico_attributes.outcomes.length > 0 ? entry.pico_attributes.outcomes.join(", ") : "No outcomes specified"}</p>
            `;
            searchResultsDiv.appendChild(entryDiv);
        });
    }
}




// Function to create pagination controls
function createPaginationControls() {
    const totalPages = Math.ceil(paginatedData.length / RESULTS_PER_PAGE);
    const paginationControlsDiv = document.getElementById("paginationControls");

    // Clear current pagination controls
    paginationControlsDiv.innerHTML = "";

    // Create Previous button
    const prevButton = document.createElement("button");
    prevButton.textContent = "Previous";
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => goToPage(currentPage - 1);
    paginationControlsDiv.appendChild(prevButton);

    // Display the first page button
    if (currentPage !== 1) {
        const firstButton = document.createElement("button");
        firstButton.textContent = 1;
        firstButton.onclick = () => goToPage(1);
        paginationControlsDiv.appendChild(firstButton);
    }

    // Display "..." if there's a gap between the first page and the current page
    if (currentPage > 3) {
        const ellipsis = document.createElement("span");
        ellipsis.textContent = "...";
        paginationControlsDiv.appendChild(ellipsis);
    }

    // Display the current page button
    const currentButton = document.createElement("button");
    currentButton.textContent = currentPage;
    currentButton.classList.add("active");
    paginationControlsDiv.appendChild(currentButton);

    // Display "..." if there's a gap between the current page and the last page
    if (currentPage < totalPages - 2) {
        const ellipsis = document.createElement("span");
        ellipsis.textContent = "...";
        paginationControlsDiv.appendChild(ellipsis);
    }

    // Display the last page button
    if (currentPage !== totalPages) {
        const lastButton = document.createElement("button");
        lastButton.textContent = totalPages;
        lastButton.onclick = () => goToPage(totalPages);
        paginationControlsDiv.appendChild(lastButton);
    }

    // Create Next button
    const nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => goToPage(currentPage + 1);
    paginationControlsDiv.appendChild(nextButton);
}

// Function to navigate to a specific page
function goToPage(page) {
    currentPage = page;
    displayPage(page);
    createPaginationControls();
}

// Initialize by loading conditions from the CSV file
window.onload = function() {
    // loadTrialsData();
    // Load conditions for filter
    loadConditionsFromAPI();

    showSection('home');  // Show Home section by default

    const { jsPDF } = window.jspdf;
    document.getElementById('report-export-button').addEventListener('click', () => {
        const element = document.getElementById('content-to-export');
        html2canvas(element).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const doc = new jsPDF();
            doc.addImage(imgData, 'PNG', 10, 10);
            doc.save('evidence-chart.pdf');
        });
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const collapsibles = document.querySelectorAll('.collapsible');

    collapsibles.forEach(collapsible => {
        collapsible.addEventListener('click', function() {
            this.classList.toggle('active');

            const content = this.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
            }
        });
    });
});
