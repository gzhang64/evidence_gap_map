// Function to draw a donut chart with a legend and hover tooltip
function draw_donut_chart(data, chartID, variable_name) {
    const element = document.getElementById(chartID.replace("#", ""))
    const width = element.offsetWidth
    const height = element.offsetWidth*0.6
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
        .domain(data.map(d => d[variable_name]))
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
        .attr('fill', d => color(d.data[variable_name]))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .on("mouseover", function(event, d) {
            tooltip.style("display", "block")
                .html(`${d.data[variable_name]}: ${d.data.count}`);
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
