// this is just fake data to test the plot
const plot_width = 400;
const plot_height = 300;
const data = [
    { year: 2016, value: 'V1', records: 1200 },
    { year: 2016, value: 'V2', records: 500 },
    { year: 2016, value: 'V3', records: 700 },
    { year: 2018, value: 'V1', records: 1500 },
    { year: 2018, value: 'V2', records: 600 },
    { year: 2018, value: 'V3', records: 900 },
    { year: 2020, value: 'V1', records: 1800 },
    { year: 2020, value: 'V2', records: 700 },
    { year: 2020, value: 'V3', records: 1100 },
    { year: 2022, value: 'V1', records: 2000 },
    { year: 2022, value: 'V2', records: 800 },
    { year: 2022, value: 'V3', records: 1200 },
    { year: 2024, value: 'V1', records: 2200 },
    { year: 2024, value: 'V2', records: 900 },
    { year: 2024, value: 'V3', records: 1300 }
];

const margin = { top: 20, right: 20, bottom: 40, left: 50 };
const width = plot_width - margin.left - margin.right;
const height = plot_height - margin.top - margin.bottom;

function trend_plot(data, element_id) {
    const svg = d3.select(`#${element_id}`)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleBand()
    .domain(data.map(d => d.year))
    .range([0, width])
    .padding(0.1);

const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.records)])
    .nice()
    .range([height, 0]);

const color = d3.scaleOrdinal()
    .domain(["V1", "V2", "V3"])
    .range(["#4e79a7", "#e15759", "#76b7b2"]);

svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

svg.append("g")
    .call(d3.axisLeft(y));

const groups = svg.selectAll(".group")
    .data(d3.groups(data, d => d.year))
    .enter().append("g")
    .attr("class", "group")
    .attr("transform", d => `translate(${x(d[0])},0)`);

const rect_order = {"V1": 0, "V2": 1, "V3": 2};
groups.selectAll("rect")
    .data(d => d[1])
    .enter().append("rect")
    .attr("x", d => x.bandwidth() / 3 * rect_order[d.value])
    .attr("y", d => y(d.records))
    .attr("width", x.bandwidth() / 3)
    .attr("height", d => height - y(d.records))
    .attr("fill", d => color(d.value));

svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom)
    .attr("text-anchor", "middle")
    .text("Year");

svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left)
    .attr("dy", "1em")
    .attr("text-anchor", "middle")
    .attr("font-size", "smaller")
    .text("Number of Records");
}
trend_plot(data, "trend-geographical")
trend_plot(data, "trend-min-age")