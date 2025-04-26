function draw_gap_map() {
  draw_matrix_view(matchedTrials)
}

// parameter data is expected to be the the global matchedTrials
function draw_matrix_view(data) {
  const outcomes = []
  const interventions = []
  data.forEach(t=>{
    t.pico_attributes.outcomes.forEach(o=>{
      if (!outcomes.includes(o.title)) {
        outcomes.push(o.title)
      }
    })
    t.pico_attributes.interventions.forEach(i=>{
      if (!interventions.includes(i.type)) {
        interventions.push(i.type)
      }
    })
  })
  const values = {}
  interventions.forEach(i=> {
    values[i] = {}
    outcomes.forEach(o=>{
      values[i][o] = data.filter(t=>
        t.pico_attributes.interventions.map(intervention=>intervention.type).includes(i) &&
        t.pico_attributes.outcomes.map(outcome=>outcome.title).includes(o)
      ).length
    })
  })

  // sorting by frequencies
  const outcome_total = {} // total number for each outcome
  outcomes.forEach( outcome => outcome_total[outcome] = interventions.reduce((total,intervention)=>total+values[intervention][outcome], 0) )
  outcomes.sort((a,b)=>outcome_total[a]<outcome_total[b])
  const intervention_total = {} // total number for each intervention
  interventions.forEach( intervention => intervention_total[intervention] = outcomes.reduce((total,outcome)=>total+values[intervention][outcome], 0) )
  interventions.sort((a,b)=>intervention_total[a]<intervention_total[b])

  const grid = document.getElementById("gap-map")
  grid.innerHTML = ""
  const popup = document.getElementById("gap-map-popup")
  popup.style.display = 'none'
  const num_ot = Math.min(outcomes.length, document.getElementById("number-of-outcomes").value)
  const num_inter = Math.min(interventions.length, document.getElementById("number-of-intervention-types").value)
  grid.insertAdjacentHTML("afterbegin", `<div style="border:thin solid lightgrey;padding:3px;">Intervention/Outcome</div>`)
  for(let j=0; j<num_ot; j++) {
        const cell = document.createElement("div")
        cell.textContent = outcomes[j]
        cell.style = "border:thin solid lightgrey;font-size:10px;padding:3px;"
        grid.appendChild(cell)
  }
  document.getElementById("primary-dimension").value = "country"
  document.getElementById("secondary-dimension").value = "gender"
  for(let i=0;i<num_inter;i++){
    const intervention = interventions[i]
    const cell = document.createElement("div")
    cell.textContent = intervention
    cell.style = "border:thin solid lightgrey;padding:3px;"
    grid.appendChild(cell)
    for(let j=0;j<num_ot;j++){
            const outcome = outcomes[j]
            const cell = document.createElement("div")
            cell.style.backgroundColor = get_blue_shade(values[intervention][outcome], min=0, max=2)
            cell.style.border = "thin solid lightgrey"
            grid.appendChild(cell)

            cell.onclick = (event) => {
              intervention_selected = intervention
              outcome_selected = outcome
              document.getElementById("radial-title").innerHTML = `Population Distribution for ${intervention} / ${outcome})`

              const data_filtered = data.filter(t=>
                t.pico_attributes.interventions.map(intervention=>intervention.type).includes(intervention) &&
                t.pico_attributes.outcomes.map(outcome=>outcome.title).includes(outcome)
              )
              const years = {}

              data_filtered.forEach(t=>{
                const year = t.study_dates.start_date.substring(0,4)
                if(years[year]===undefined) years[year] = 1
                else years[year] += 1
              })
              const count_over_years = []
              for(let y in years) count_over_years.push({year: y, value: 'count', records:years[y]})
              trend_plot(count_over_years, "gap-map-trend")

              const dim1 = document.getElementById("primary-dimension").value
              const dim2 = document.getElementById("secondary-dimension").value
              const counts = group_by_2d(data_filtered, dim1, dim2)
              const counts_no_label = [] // for now
              for(let cat1 in counts) {
                const values = Object.values(counts[cat1])
                counts_no_label.push({category:cat1, values: values})
              }

              popup.style.display = 'flex'
              create_radial_stacked_plot(counts_no_label, "radial-stacked")
              trend_plot(count_over_years, "gap-map-trend")
            }
            document.getElementById("close-button").onclick = () => {
                 popup.style.display = 'none';
            }
        }
    }
}

// aggregate the data on the frontend
function group_by_2d(filtered_data, primary_dim, secondary_dim) {
  result = {}
  filtered_data.forEach(element => {
    const primary = element.pico_attributes.populations[primary_dim]
    const secondary = element.pico_attributes.populations[secondary_dim]
    const x = result[primary]
    if(x===undefined) result[primary] = {}
    if(result[primary][secondary]===undefined) result[primary][secondary] = 1
    else result[primary][secondary] += 1
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

// TODO eventually we should refactor avoid re-querying
let intervention_selected = ""
let outcome_selected = ""
function redraw_radial() {
  const dim1 = document.getElementById("primary-dimension").value
  const dim2 = document.getElementById("secondary-dimension").value
  const data_filtered = matchedTrials.filter(t=>
    t.pico_attributes.interventions.map(intervention=>intervention.type).includes(intervention_selected) &&
    t.pico_attributes.outcomes.map(outcome=>outcome.title).includes(outcome_selected)
  )
  const counts_no_label = [] // for now
  const counts = group_by_2d(data_filtered, dim1, dim2)
  for(let cat1 in counts) {
        const values = Object.values(counts[cat1])
        counts_no_label.push({category:cat1, values: values})
  }
  create_radial_stacked_plot(counts_no_label, "radial-stacked")
}