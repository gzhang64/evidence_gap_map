let conditions = []; // Empty array to store conditions from CSV
let selectedGroups = [[]]; // Array to store groups of conditions
let matchedTrials = [];
let population_country = {};  // Object to store nct_id and country data
const RESULTS_PER_PAGE = 10;
let currentPage = 1;
let paginatedData = [];
let trial_collection = [];

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
            chip.appendChild(document.createTextNode(condition))
            const x = document.createElement("span")
            x.textContent = 'x'
            x.className = "remove-chip"
            x.onclick = ()=>removeCondition(condition)
            chip.appendChild(x)
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
    document.querySelector('.visualizations-column').style.display = 'none' // hide the plots until search is carried out again
    // clear evidence-gap-map
    matchedTrials = []
    document.getElementById("gap-map").innerHTML = ""
    document.getElementById("egm-section").style.display = "none"
    // clear the tabular result
    const searchResultsContainer = document.getElementById("searchResults")
    searchResultsContainer.innerHTML = ""
    searchResultsContainer.style.display = 'none'
    // clear pagination control
    const paginationControlsDiv = document.getElementById("paginationControls");
    paginationControlsDiv.innerHTML = "";
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

        // this only to safe-guide the messy data
        matchedTrials.forEach(trial => {
            if( trial.pico_attributes.outcomes===undefined) {
                trial.pico_attributes.outcomes = []
            }
        })
        matchedTrials.forEach(trial => {
            if( trial.pico_attributes.interventions===undefined) {
                trial.pico_attributes.interventions = []
            }
        })

        document.getElementById("egm-section").style.display = "block"
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
        dual_trend_plot(group_by_country(matchedTrials), "trend-geographical")

        const { minAgeCount, maxAgeCount } = countMinAndMaxAges(matchedTrials);

        createAgeBarChart(minAgeCount, '#bar-chart-min-age', 'Minimum Age');
        dual_trend_plot(aggregate_by_year(matchedTrials, 
            t=>normalizeAgeToBin(t.pico_attributes.populations.minimum_age || "NA") ), "trend-min-age")
        createAgeBarChart(maxAgeCount, '#bar-chart-max-age', 'Maximum Age');
        dual_trend_plot(aggregate_by_year(matchedTrials, 
            t=>normalizeAgeToBin(t.pico_attributes.populations.maximum_age || "NA") ), "trend-max-age")

        const genderCount = countGenderDistribution(matchedTrials);
        const genderData = Object.entries(genderCount).map(([gender, count]) => ({
            gender,
            count
        }));
        draw_donut_chart(genderData, '#gender-donut-chart', 'gender');
        dual_trend_plot(aggregate_by_year(matchedTrials,
            trial=>normalizeGender(trial.pico_attributes.populations.gender || "N/A")
        ), "trend-gender")

        // Count intervention types and render the intervention type donut chart
        const interventionCount = countInterventionTypes(matchedTrials);
        const interventionData = Object.entries(interventionCount).map(([intervention, count]) => ({
            intervention,
            count
        }));
        draw_donut_chart(interventionData, '#intervention-pie-chart', 'intervention');
        dual_trend_plot(intervention_types_by_year(matchedTrials), "trend-intervention-types")

        const top20Interventions = getTop20Interventions(matchedTrials);
        draw_horizontal_bar_chart(top20Interventions, '#top20-interventions-bar-chart', 'intervention');
        dual_trend_plot(count_multiple_properties_by_year(matchedTrials, 'interventions'), "trend-top-interventions")

        const top20Outcomes = getTop20Outcomes(matchedTrials);
        draw_horizontal_bar_chart(top20Outcomes, '#top20-outcomes-bar-chart', 'outcome');
        dual_trend_plot(count_multiple_properties_by_year(matchedTrials, 'outcomes'), "trend-top-outcomes")
    } catch (error) {
        console.error("Error in submitSearch:", error);
    }
}

function top_intervention_names_by_year(matchedTrials, top_intervention_names) {
    const aggregated = matchedTrials.reduce((acc, trial) => {
        const year = trial.study_dates.start_date.substring(0,4)
        const intervention_names = trial.pico_attributes.interventions.map(x=>x.name) || []
        for(const t of intervention_names) {
            if(!top_intervention_names.includes(t)) continue
            if(!acc[year]) {
                acc[year] = {}
            } else {
                if(!acc[year][t]) {
                    acc[year][t] = 1
                } else {
                    acc[year][t]++
                }
            }
        }
        return acc
      }, {})
    const as_array=[]
    for(const year in aggregated) {
        const values = aggregated[year]
        for(const v in values) {
            as_array.push({
                year: year,
                value: v,
                records: +values[v]})
        }
    }
    return as_array
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
    const element = document.getElementById("map").parentElement
    const width = element.offsetWidth
    const height = element.offsetWidth*0.6

    const svg = d3.select("#map")
        .attr("width", width)
        .attr("height", height);

    // Adjust the projection to rotate the globe
    const projection = d3.geoNaturalEarth1()
        .scale(width/5)
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

// Function to count intervention types from matchedTrials
function countInterventionTypes(matchedTrials) {
    const interventionCount = {};

    matchedTrials.forEach(trial => {
        const intervention_types = trial.pico_attributes.interventions.map(x=>x.type) || [];
        intervention_types.forEach(intervention_type => {
            interventionCount[intervention_type] = (interventionCount[intervention_type] || 0) + 1;
        });
    });

    console.log("Intervention types: ", interventionCount);

    return interventionCount;
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

// Function to get the top 20 interventions from matchedTrials
function getTop20Interventions(matchedTrials) {
    const interventionCount = {};

    // Count occurrences of each intervention
    matchedTrials.forEach(trial => {
        const interventions = trial.pico_attributes.interventions.map(x=>x.name) || [];
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

// Function to get the top 20 outcomes from matchedTrials
function getTop20Outcomes(matchedTrials) {
    const outcomeCount = {};

    // Count occurrences of each outcome
    matchedTrials.forEach(trial => {
        const outcomes = (trial.pico_attributes.outcomes || []).map(outcome=>outcome.title);
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

            const intervention_types = entry.pico_attributes.interventions.map(item=>item.type).reduce((acc, type)=> acc===""?type:`${acc},${type}`, "")

            // this format applies to both intervention and outcome
            // use , ; | to show three layer of data format
            const reduce_canonical_names = function(acc, triple_layer_object) {
                const tmp = []
                const concepts = triple_layer_object.concepts
                for(let key in concepts) {
                  tmp.push( concepts[key].reduce((sub, item)=>{
                        return sub==='' ? item.canonical_name : sub+", "+item.canonical_name
                    }, '')
                  )
                }
                return acc==='' ? tmp.join("; ") : acc+" | "+tmp.join("; ")
            }
            const interventions = entry.pico_attributes.interventions.reduce(reduce_canonical_names, "")
            const outcomes = entry.pico_attributes.outcomes.reduce(reduce_canonical_names, "")

            //const debug = entry.pico_attributes.populations.conditions
            //const conditions = entry.pico_attributes.populations.conditions.reduce(reduce_canonical_names, "")
            // FIXME temporary solution. TODO the conditions of the original data format should be used
            const concepts = entry.pico_attributes.populations.conditions.concepts
            const tmp = []
            for(let key in concepts) {
                  tmp.push( concepts[key].reduce((sub, item)=>{
                        return sub==='' ? item.canonical_name : sub+", "+item.canonical_name
                    }, '')
                  )
            }
            const conditions = tmp.join()

            entryDiv.innerHTML = `
                <h4>${entry.title || "Untitled Entry"}</h4> <!-- Display the title field -->
                <p><a href="https://clinicaltrials.gov/study/${entry.nct_id}" target=_blank>${entry.nct_id}</a></p>
                <p><strong>Conditions:</strong> ${conditions ? conditions : "Not specified"}</p>
                <p><strong>Population:</strong><br> ${populationDetails}</p>
                <p><strong>Interventions:</strong> ${interventions ? interventions : "Not specified"}</p>
                <p><strong>Intervention types:</strong> ${intervention_types ? intervention_types : "Not specified"}</p>
                <p><strong>Outcomes:</strong> ${outcomes ? outcomes : "No outcomes specified"}</p>
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

function set_tab_status(id, selected) {
    const background_color = "#0a2240"
    const color = "white"
    const selected_background_color = "#E1E1E1"
    const selected_color = "#0A2240"
    if(selected) {
        document.getElementById(id).style.backgroundColor = selected_background_color
        document.getElementById(id).style.color = selected_color
    } else {
        document.getElementById(id).style.backgroundColor = background_color
        document.getElementById(id).style.color = color
    }
}

// Initialize by loading conditions from the CSV file
window.onload = function() {
    // Load conditions for filter
    loadConditionsFromAPI();

    showSection('home');  // Show Home section by default

    set_tab_status("show-total", true)
    set_tab_status("show-trend", false)

    document.getElementById("show-total").onclick = function(event) {
        set_tab_status("show-total", true)
        set_tab_status("show-trend", false)
        document.querySelectorAll(".left-of-pair").forEach(item=>item.style.display='block')
        document.querySelectorAll(".right-of-pair").forEach(item=>item.style.display='none')
    }
    document.getElementById("show-trend").onclick = function(event) {
        set_tab_status("show-total", false)
        set_tab_status("show-trend", true)
        document.querySelectorAll(".right-of-pair").forEach(item=>item.style.display='block')
        document.querySelectorAll(".left-of-pair").forEach(item=>item.style.display='none')
    }

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
