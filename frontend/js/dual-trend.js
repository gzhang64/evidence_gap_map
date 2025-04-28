// this is a new design of a trend plot with two panels: 
// a main one for count and an embedded one for percentage
function dual_trend_plot(x_data, element_id) {
    const keys = x_data.groups
    const data = x_data.data.filter(item => item.year !== "na")
    data.forEach(item => {
        item.year = +item.year // necessary or not
        keys.forEach(k => { if (item[k] === undefined) item[k] = 0 }) // safe-guard for later process
    })

    const colors = d3.scaleOrdinal(d3.schemeTableau10);

    const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const subMargin = { top: 10, right: 10, bottom: 20, left: 30 };
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
            const mouseX = event.layerX - margin.left;
            const bisectYear = d3.bisector(data => data.year).left;
            const x0 = x.invert(mouseX);
            const i = bisectYear(data, x0, 1);
            const d0 = data[i - 1];
            const d1 = data[i];
            const currentData = (x0 - d0.year > d1.year - x0) ? d1 : d0;
            // DEBUG d.data===undefined
            // FIXME the tooltip's year (x-coordinate) is off

            d3.select(this)
                .style("opacity", 1);
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html(`<strong>${d.key}</strong><br>Year: ${currentData.year}<br>Count: ${currentData[d.key]}`)
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
        .attr("y", height + margin.bottom - 5)
        .style("text-anchor", "middle")
        .text("Year");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 15)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Keyword Count");

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
        .call(d3.axisBottom(subX).ticks(5).tickFormat(d3.format("d")));

    subSvg.append("g")
        .attr("class", "axis sub-y-axis")
        .call(subYAxis.ticks(5));

    // Legend
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 150}, 20)`);

    legend.selectAll("rect")
        .data(keys)
        .join("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d => colors(d));

    legend.selectAll("text")
        .data(keys)
        .join("text")
        .attr("x", 20)
        .attr("y", (d, i) => i * 20 + 12)
        .text(d => d)
        .style("font-size", "0.9em");

    // Tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
}