function trend_plot(data, element_id) {
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const plot_width = document.getElementById(element_id).clientWidth
    const plot_height = document.getElementById(element_id).clientHeight
    const width = plot_width - margin.left - margin.right
    const height = plot_height - margin.top - margin.bottom
    d3.select(`#${element_id}`).selectAll("svg").remove()
    const svg = d3.select(`#${element_id}`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const years = data.map(item => item.year)
    const first_year = Math.min(...years)
    const last_year = Math.max(...years)
    const x = d3.scaleLinear()
        .domain([first_year, last_year])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.records)])
        .nice()
        .range([height, 0]);

    const color = d3.scaleOrdinal(d3.schemeAccent);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("d")));

    svg.append("g")
        .call(d3.axisLeft(y));

    const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.records));

    data.map(item => item.value).forEach(value => {
        const d = data.filter(d => d.value === value);
        svg.append("path")
            .datum(d)
            .attr("fill", "none")
            .attr("stroke", color(value))
            .attr("stroke-width", 1.5)
            .attr("d", line);

        const value_for_selector = value.replace(/[\s\<]/g, '')
        svg.selectAll(`.dot-${value_for_selector}`)
            .data(d)
            .enter().append("circle")
            .attr("class", `dot-${value_for_selector}`)
            .attr("cx", d => x(d.year))
            .attr("cy", d => y(d.records))
            .attr("r", 3)
            .attr("fill", color(value));
    });

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .attr("text-anchor", "middle")
        .attr("font-size", "x-small")
        .text("Year");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left)
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
        .attr("font-size", "x-small")
        .text("Number of Records");
}
