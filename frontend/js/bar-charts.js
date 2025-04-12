// Function to draw a horizontal bar chart
function draw_horizontal_bar_chart(data, chartID, variable_name) {
    const margin = { top: 20, right: 0, bottom: 20, left: 150 };
    const element = document.getElementById(chartID.replace("#", ""))
    const width = element.offsetWidth - margin.left - margin.right;
    const height = element.offsetWidth*0.6 - margin.top - margin.bottom;

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

    // Y scale (use the variable names as categories)
    const y = d3.scaleBand()
        .domain(data.map(d => d[variable_name]))
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

    // Tooltip setup
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
        .attr("y", d => y(d[variable_name]))
        .attr("width", d => x(d.count))
        .attr("height", y.bandwidth())
        .attr("fill", "#2d64a8")
        .on("mouseover", function(event, d) {
            tooltip.style("display", "block")
                .html(`${d[variable_name]}: ${d.count}`);
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("display", "none");
        });
}

// Function to create a vertical bar chart for age distribution
function createAgeBarChart(data, chartID, title) {
    // Set up margin and dimensions
    const margin = { top: 20, right: 10, bottom: 60, left: 40 };
    const element = document.getElementById(chartID.replace("#", ""))
    const width = element.offsetWidth - margin.left - margin.right;
    const height = element.offsetWidth*0.6 - margin.top - margin.bottom;

    // Clear previous chart content
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

    // Create SVG
    const svg = d3.select(chartID)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define scales with dynamic width
    const x = d3.scaleBand()
        .domain(sortedData.map(d => d[0]))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, maxY])
        .range([height, 0]);

    // X axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickSize(0))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-0.5em")
        .attr("dy", "0.15em")
        .attr("transform", "rotate(-45)");

    // Y axis
    svg.append("g")
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

    // Bars
    svg.selectAll(".bar")
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
