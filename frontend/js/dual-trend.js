// this is a new design of a trend plot with two panels: 
// a main one for count and an embedded one for percentage
function dual_trend_plot(x_data, element_id, order_by_total = true) {
    const keys = order_by_total ? Object.keys(x_data.groups).sort((a, b) => {
        if (a === 'N/A') return 1;
        else if (b === 'N/A') return -1;
        else return x_data.groups[a] < x_data.groups[b]
    }) : Object.keys(x_data.groups).sort((a, b) => ageBins.indexOf(a) > ageBins.indexOf(b))
    const others = keys.splice(20, Infinity, "Others")
    x_data.groups.Others = 0
    others.forEach(k => x_data.groups.Others += x_data.groups[k]) // FIXME  this is correct *only if* the groups are mutually exclusive
    const data = x_data.data.filter(item => item.year !== "na")
    data.forEach(item => {
        item.year = +item.year // necessary or not
        item.Others = others.reduce((acc, x) => acc + item[x] || 0, 0) // FIXME this is correct *only if* the groups are mutually exclusive
        keys.forEach(k => { if (item[k] === undefined) item[k] = 0 }) // safe-guard for later process
    })

    const colors = d3.scaleOrdinal(d3.schemeTableau10);

    // do not use client dimension because the plot is created before it is displayed
    const element_width = 600
    const element_height = 400
    const margin = { top: 20, right: 100, bottom: 30, left: 50 };
    const width = element_width - margin.left - margin.right;
    const height = element_height - margin.top - margin.bottom;

    const subMargin = { top: 10, right: 10, bottom: 20, left: 50 };
    const subWidth = 150 - subMargin.left - subMargin.right;
    const subHeight = 100 - subMargin.top - subMargin.bottom;

    d3.select(`#${element_id}`).selectAll("svg").remove()
    const svg = d3.select(`#${element_id}`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const subSvg = svg.append("g")
        .attr("transform", `translate(${subMargin.left},${subMargin.top})`);

    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([0, width]);

    const yAbsolute = d3.scaleLinear()
        .domain([0, d3.max(data, d => d3.sum(keys, key => d[key]))])
        .range([height, 0]);

    const yPercentage = d3.scaleLinear()
        .domain([0, 1])
        .range([subHeight, 0]);

    const areaAbsolute = d3.area()
        .x(d => x(d.data.year))
        .y0(d => yAbsolute(d[0]))
        .y1(d => yAbsolute(d[1]));

    const areaPercentage = d3.area()
        .x(d => subX(d.data.year))
        .y0(d => yPercentage(d[0]))
        .y1(d => yPercentage(d[1]));

    const stack = d3.stack().keys(keys);
    const stackedDataAbsolute = stack(data);

    // Calculate percentage data
    const stackedDataPercentage = data.map(d => {
        const total = d3.sum(keys, key => d[key]);
        const row = { year: d.year };
        keys.forEach(key => {
            row[key] = total === 0 ? 0 : d[key] / total;
        });
        return row;
    });
    const stackedPercentage = stack(stackedDataPercentage);

    // Main chart - Absolute counts
    svg.selectAll(".area")
        .data(stackedDataAbsolute)
        .join("path")
        .attr("class", "area")
        .attr("d", areaAbsolute)
        .attr("fill", d => colors(d.key))
        .style("opacity", 0.8)
        .on("mouseover", function (event, d) {
            d3.select(this)
                .style("opacity", 1);
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html(`<strong>${d.key}</strong><br>Count: ${x_data.groups[d.key]}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function () {
            d3.select(this)
                .style("opacity", 0.8);
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    svg.append("g")
        .attr("class", "axis y-axis")
        .call(d3.axisLeft(yAbsolute));

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .style("text-anchor", "middle")
        .attr("font-size", "small")
        .text("Year");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 5)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("font-size", "small")
        .text("Number of Studies");

    // Sub-panel - Percentage
    const subX = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([0, subWidth]);

    const subYAxis = d3.axisLeft(yPercentage).tickFormat(d3.format(".0%"));

    subSvg.selectAll(".sub-area")
        .data(stackedPercentage)
        .join("path")
        .attr("class", "sub-area")
        .attr("d", areaPercentage)
        .attr("fill", d => colors(d.key))
        .style("opacity", 0.6);

    subSvg.append("g")
        .attr("class", "axis sub-x-axis")
        .attr("transform", `translate(0,${subHeight})`)
        .call(d3.axisBottom(subX).ticks(3).tickFormat(d3.format("d")));

    subSvg.append("g")
        .attr("class", "axis sub-y-axis")
        .call(subYAxis.ticks(5));

    // Legend
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 5}, 20)`);

    const first10keys = keys.slice(0, 10) // to limit the number of legend items
    legend.selectAll("rect")
        .data(first10keys)
        .join("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d => colors(d));

    const legend_limit = 11
    legend.selectAll("text")
        .data(first10keys)
        .join("text")
        .attr("x", 20)
        .attr("y", (d, i) => i * 20 + 12)
        .text(d => d.length <= legend_limit ? d : d.substring(0, legend_limit) + "...")
        .style("font-size", "0.9em");

    // Tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
}

function intervention_types_by_year(matchedTrials) {
    const groups = {}
    const aggregated = matchedTrials.reduce((acc, trial) => {
        const year = trial.study_dates.start_date.substring(0, 4)
        trial.pico_attributes.interventions.forEach(intervention => {
            const value = intervention.type
            if (!groups[value]) {
                groups[value] = 1
            } else {
                groups[value]++
            }
            if (!acc[year]) {
                acc[year] = {}
            } else {
                if (!acc[year][value]) {
                    acc[year][value] = 1
                } else {
                    acc[year][value]++
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

function aggregate_by_year(matchedTrials, property) {
    const groups = {}
    const aggregated = matchedTrials.reduce((acc, trial) => {
        const year = trial.study_dates.start_date.substring(0, 4)
        const value = property(trial) || "N/A"
        if (!groups[value]) {
            groups[value] = 1
        } else {
            groups[value]++
        }
        if (!acc[year]) {
            acc[year] = {}
        } else {
            if (!acc[year][value]) {
                acc[year][value] = 1
            } else {
                acc[year][value]++
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

function count_multiple_properties_by_year(matchedTrials, property) {
    const groups = {}
    const aggregated = matchedTrials.reduce((acc, trial) => {
        const year = trial.study_dates.start_date.substring(0, 4)
        const values = []
        trial.pico_attributes[property].forEach(p => {
            for (let key in p.concepts) {
                // concepts[key] is an array
                p.concepts[key].forEach(item => {
                    if (!values.includes(item.canonical_name))
                        values.push(item.canonical_name)
                })
            }
        })
        values.forEach(value => {
            if (!groups[value]) {
                groups[value] = 1
            } else {
                groups[value]++
            }
            if (!acc[year]) {
                acc[year] = {}
            } else {
                if (!acc[year][value]) {
                    acc[year][value] = 1
                } else {
                    acc[year][value]++
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
