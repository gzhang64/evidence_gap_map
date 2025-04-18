function draw_gap_map() {
    fetch(`http://127.0.0.1:5000/api/total`).then(response => {
      response.json().then(x=>{
        draw_matrix_view(x)
      })
    }).catch(error => {
      console.error("Error:", error);
    });
}

function draw_matrix_view(data) {
  const outcomes = data.map(item=>item.outcome).reduce((accumulator, current) => {
    if (!accumulator.includes(current)) {
        accumulator.push(current);
    }
    return accumulator;
  }, []);
  const interventions = data.map(item=>item.intervention).reduce((accumulator, current) => {
    if (!accumulator.includes(current)) {
        accumulator.push(current);
    }
    return accumulator;
  }, []);
  const values = {}
  data.forEach(item=>{
    const it = item.intervention
    const ot = item.outcome
    let row = values[it]
    if(row===undefined) {
      values[it] = {}
      row = values[it]
    }
    row[ot] = item.count
  })

  const grid = document.getElementById("gap-map")
  const num_ot = Math.min(outcomes.length, document.getElementById("number-of-outcomes").value)
  const num_inter = Math.min(interventions.length, document.getElementById("number-of-intervention-types").value)
  grid.insertAdjacentHTML("afterbegin", `<div style="border:thin solid lightgrey;padding:3px;">Intervention/Outcome</div>`)
  for(let j=0; j<num_ot; j++) {
        const cell = document.createElement("div")
        cell.textContent = outcomes[j]
        cell.style = "border:thin solid lightgrey;font-size:10px;padding:3px;"
        grid.appendChild(cell)
  }
  for(let i=0;i<num_inter;i++){
    const intervention = interventions[i]
    const cell = document.createElement("div")
    cell.textContent = intervention
    cell.style = "border:thin solid lightgrey;padding:3px;"
    grid.appendChild(cell)
    for(let j=0;j<num_ot;j++){
            const outcome = outcomes[j]
            const cell = document.createElement("div")
            cell.style.backgroundColor = get_blue_shade(values[intervention][outcome])
            cell.style.border = "thin solid lightgrey"
            grid.appendChild(cell)

            const popup = document.getElementById("gap-map-popup")
            cell.addEventListener('mouseenter', (event) => {
              document.getElementById("radial-title").textContent = `Distribution by ${intervention} and ${outcome}`

              fetch(`http://127.0.0.1:5000/api/count/${intervention}/${outcome}`).then(response => {
                response.json().then(x=>{
                  const count_over_years = x.map( item=>({year: item.year, value:"count", records: item.count}) )
                  trend_plot(count_over_years, "gap-map-trend")
                })
              }).catch(error => {
                console.error("Error:", error);
              });

              fetch(`http://127.0.0.1:5000/api/trials/${intervention}/${outcome}`).then(response => {
                response.json().then(x=>{
                  const counts = group_by_2d(x, "country", "gender")
                  const counts_no_label = [] // for now
                  for(let country in counts) {
                    const values = Object.values(counts[country])
                    counts_no_label.push({category:country, values: values})
                  }
                  create_radial_stacked_plot(counts_no_label, "radial-stacked")
                })
              }).catch(error => {
                console.error("Error:", error);
              });

              popup.style.display = 'flex'
              });
            cell.addEventListener('mouseleave', () => {
                popup.style.display = 'none';
            });
        }
    }
}

// aggregate the result from API
function group_by_2d(data, primary_dim, secondary_dim) {
  result = {}
  data.forEach(element => {
    const primary = element[primary_dim]
    const secondary = element[secondary_dim]
    const x = result[primary]
    if(x===undefined) result[primary] = {}
    if(result[primary][secondary]===undefined) result[primary][secondary] = element.count
    else result[primary][secondary] += element.count
  })
  return result
}

// brighter for larger value; lighter color of smaller value
function get_blue_shade(value, min=0, max=150) {
    if(value===null) return "lightgray"
    // normalize to a range between 0 and 255
    const diff = Math.max(value - min, 0)
    const lightness = 255 - Math.floor((Math.min(diff, max) / max) * 255);
    // use the lightness value to create a lighter blue (closer to white)
    return `rgb(${lightness}, ${lightness}, 255)`;
}

/* the data is an array, where each element has two field: category as a string, and values as an array of numeric values */
function create_radial_stacked_plot(data, element_id) {
  const element_width = document.getElementById(element_id).clientWidth
  d3.select(`#${element_id}`).selectAll("svg").remove()
  if(data.length==0) return // empty dataset

  const width = element_width;
  const height = element_width;
  const innerRadius = 50;
  const outerRadius = Math.min(width, height) / 2 - 10;
  
  // create SVG container
  const svg = d3.select(`#${element_id}`)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width/2},${height/2})`);
  
  // create the stack generator
  const sizes = data.map(d=>d.values.length)
  const max_size = Math.max(...sizes)
  const keys = []
  for(let k=0; k<max_size; k++)keys.push(k)
  const stack = d3.stack()
    .keys(keys) // Corresponding to the indices of values arrays
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);
  
  // process the data for stacking
  const stackedData = stack(data.map(d => d.values));
  
  // create the radial scale
  const x = d3.scaleBand()
    .domain(data.map(d => d.category))
    .range([0, 2 * Math.PI])
    .align(0);
  
  // create the radius scale
  const y = d3.scaleRadial()
    .domain([0, d3.max(stackedData[stackedData.length - 1], d => d[1])])
    .range([innerRadius, outerRadius]);
  
  // create arcs for each segment
  const arc = d3.arc()
    .innerRadius(d => y(d[0]))
    .outerRadius(d => y(d[1]))
    .startAngle(d => x(d.data.category))
    .endAngle(d => x(d.data.category) + x.bandwidth())
    .padAngle(0.01)
    .padRadius(innerRadius);

  const color = d3.scaleOrdinal(d3.schemeAccent);
  // add the segments to the chart
  const groups = svg.append("g")
    .selectAll("g")
    .data(stackedData)
    .join("g")
      //.attr("fill", (d, i) => color(i));
      .attr("fill", d => color(d.key));
  
  groups.selectAll("path")
    .data(d => {
      return d.map((segment, i) => ({
        ...segment,
        data: { category: data[i].category }
      }));
    })
    .join("path")
      .attr("d", arc)
      .append("title")
      .text(d => `${d.data.category}: ${d[1] - d[0]}`);
  
  // add category labels
  svg.append("g")
    .selectAll("g")
    .data(data)
    .join("g")
      .attr("text-anchor", "middle")
      .attr("transform", d => `
        rotate(${(x(d.category) + x.bandwidth() / 2) * 180 / Math.PI - 90})
        translate(${innerRadius - 20},0)
        ${(x(d.category) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "" : "rotate(180)"}
      `)
    .append("text")
      .attr("transform", d => (x(d.category) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? 
        "rotate(90)translate(0,5)" : "rotate(-90)translate(0,5)")
      .text(d => d.category);
}