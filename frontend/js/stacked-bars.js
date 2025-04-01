function group_by_intervention_type(data) {
    const groups = []
    const aggregated = data.reduce((acc, trial) => {
        const year = trial.time
        trial.pico_attributes.interventions.forEach(intervention=>{
            const t = intervention.type
            if (!groups.includes(t)) {
                groups.push(t)
            }
            if (!acc[year]) {
                acc[year] = {}
            } else {
                if (!acc[year][t]) {
                    acc[year][t] = 1
                } else {
                    acc[year][t]++
                }
            }
        })
        return acc
    }, {})
    const as_array = []
    for (const year in aggregated) {
        const values = aggregated[year]
        values.year = year
        as_array.push(values)
    }
    return { groups: groups, data: as_array }
}

function group_by_gender(data) {
    const groups = []
    const aggregated = data.reduce((acc, trial) => {
        const year = trial.time
        const t = trial.pico_attributes.populations.gender
        if (!groups.includes(t)) {
            groups.push(t)
        }
        if (!acc[year]) {
            acc[year] = {}
        } else {
            if (!acc[year][t]) {
                acc[year][t] = 1
            } else {
                acc[year][t]++
            }
        }

        return acc
    }, {})
    const as_array = []
    for (const year in aggregated) {
        const values = aggregated[year]
        values.year = year
        as_array.push(values)
    }
    return { groups: groups, data: as_array }
}

function group_by_age(data) {
    const groups = []
    const aggregated = data.reduce((acc, trial) => {
        const year = trial.time
        const t = normalizeAgeToBin(trial.pico_attributes.populations.minimum_age || "NA");
        if (!groups.includes(t)) {
            groups.push(t)
        }
        if (!acc[year]) {
            acc[year] = {}
        } else {
            if (!acc[year][t]) {
                acc[year][t] = 1
            } else {
                acc[year][t]++
            }
        }

        return acc
    }, {})
    const as_array = []
    for (const year in aggregated) {
        const values = aggregated[year]
        values.year = year
        as_array.push(values)
    }
    return { groups: groups, data: as_array }
}

function group_by_country(data) {
    const groups = []
    const aggregated = data.reduce((acc, trial) => {
        const year = trial.time
        const t = trial.pico_attributes.populations.country
        if (!groups.includes(t)) {
            groups.push(t)
        }
        if (!acc[year]) {
            acc[year] = {}
        } else {
            if (!acc[year][t]) {
                acc[year][t] = 1
            } else {
                acc[year][t]++
            }
        }

        return acc
    }, {})
    const as_array = []
    for (const year in aggregated) {
        const values = aggregated[year]
        values.year = year
        as_array.push(values)
    }
    return { groups: groups, data: as_array }
}

function stacked_bars(all_data, group_by, element_id, searchQuery, title) {
    const { groups, data } = group_by(all_data)
    // Set up dimensions
    const margin = { top: 40, right: 100, bottom: 60, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    d3.select(`#${element_id}`).selectAll("svg").remove()
    const svg = d3.select(`#${element_id}`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Prepare data for stacking
    const stack = d3.stack().keys(groups);
    const stackedData = stack(data);

    // Scales
    const x = d3.scaleBand()
        .domain(data.map(d => d.year))
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(stackedData[stackedData.length - 1], d => Number.isNaN(d[1]) ? d[0] : d[1])])
        .nice()
        .range([height, 0]);

    // Color scale for age groups
    const color = d3.scaleOrdinal(d3.schemeAccent);
    /*
    d3.scaleOrdinal()
        .domain(groups)
        .range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"]);
    */

    // Draw stacked bars
    svg.append("g")
        .selectAll("g")
        .data(stackedData)
        .enter().append("g")
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .enter().append("rect")
        .attr("x", d => x(d.data.year))
        .attr("y", d => y(d[1]))
        .attr("height", d => Number.isNaN(d[1]) ? 0 : y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth());

    // Add X axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    // Add Y axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add axis labels
    svg.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Year");

    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .text("Number of Studies");

    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(`${title} (${searchQuery})`);

    // Add legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width + 20}, 20)`);

    groups.forEach((group, i) => {
        const legendItem = legend.append("g")
            .attr("transform", `translate(0, ${i * 20})`);

        legendItem.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", color(group));

        legendItem.append("text")
            .attr("x", 20)
            .attr("y", 12)
            .attr("class", "legend")
            .text(group);
    });
}