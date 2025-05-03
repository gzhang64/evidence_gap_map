function draw_gap_map() {
  const default_label = "Display Evidence Gap Map"
  const current = document.getElementById("display-egm").textContent
  if (current == default_label) {
    draw_matrix_view(matchedTrials)
    document.getElementById("display-egm").textContent = "Hide Evidence Gap Map"
  } else {
    document.getElementById('gap-map').style.display = 'none'
    document.getElementById("display-egm").textContent = default_label
  }
}

function match_intervention(trial, intervention_x) {
  let match_i = false
  trial.pico_attributes.interventions.forEach(intervention => {
    if (match_i) return
    for (let key in intervention.concepts) {
      // concepts[key] is an array
      if (intervention.concepts[key].some(item => item.canonical_name == intervention_x)) {
        match_i = true
        return
      }
    }
  })
  return match_i
}

function match_outcome(trial, outcome_x) {
  let match_o = false
  trial.pico_attributes.outcomes.forEach(outcome => {
    if (match_o) return
    for (let key in outcome.concepts) {
      // concepts[key] is an array
      if (outcome.concepts[key].some(item => item.canonical_name == outcome_x)) {
        match_o = true
        return
      }
    }
  })
  return match_o
}

function match(trial, intervention_x, outcome_x) {
  let match_i = false
  trial.pico_attributes.interventions.forEach(intervention => {
    if (match_i) return
    for (let key in intervention.concepts) {
      // concepts[key] is an array
      if (intervention.concepts[key].some(item => item.canonical_name == intervention_x)) {
        match_i = true
        return
      }
    }
  })
  if (!match_i) return false

  let match_o = false
  trial.pico_attributes.outcomes.forEach(outcome => {
    if (match_o) return
    for (let key in outcome.concepts) {
      // concepts[key] is an array
      if (outcome.concepts[key].some(item => item.canonical_name == outcome_x)) {
        match_o = true
        return
      }
    }
  })
  if (!match_o) return false

  return true
}

// parameter data is expected to be the the global matchedTrials
function draw_matrix_view(data) {
  const outcomes_set = new Set()
  const interventions_set = new Set()
  data.forEach(t => {
    const outcomes_per_trial = new Set()
    t.pico_attributes.outcomes.forEach(o => {
      for (let key in o.concepts) {
        // concepts[key] is an array
        o.concepts[key].forEach(item => {
          outcomes_per_trial.add(item.canonical_name)
        })
      }
    })
    const interventions_per_trial = new Set()
    t.pico_attributes.interventions.forEach(i => {
      for (let key in i.concepts) {
        // concepts[key] is an array
        i.concepts[key].forEach(item => {
          interventions_per_trial.add(item.canonical_name)
        })
      }
    })
    if (outcomes_per_trial.size > 0 && interventions_per_trial.size > 0) {
      outcomes_per_trial.forEach(x => outcomes_set.add(x))
      interventions_per_trial.forEach(x => interventions_set.add(x))
    }
  })
  const outcomes = [...outcomes_set]
  const interventions = [...interventions_set]
  console.debug("outcomes", outcomes)
  console.debug("sizes of interventions/outcomes", interventions.length, outcomes.length)

  // filtered trials for each combination of intervention and outcome
  interventions.forEach(intervention => {
    data_filtered[intervention] = {}
    outcomes.forEach(outcome => {
      data_filtered[intervention][outcome] = data.filter(t => match(t, intervention, outcome))
    })
  })

  // sorting by frequencies
  const outcome_total = {} // total number for each outcome
  outcomes.forEach(outcome => outcome_total[outcome] = interventions.reduce((total, intervention) =>
    total + data_filtered[intervention][outcome].length, 0))
  outcomes.sort((a, b) => outcome_total[a] < outcome_total[b])
  const intervention_total = {} // total number for each intervention
  interventions.forEach(intervention => intervention_total[intervention] = outcomes.reduce((total, outcome) =>
    total + data_filtered[intervention][outcome].length, 0))
  interventions.sort((a, b) => intervention_total[a] < intervention_total[b])

  const grid = document.getElementById("gap-map")
  grid.innerHTML = ""
  const popup = document.getElementById("gap-map-popup")
  popup.style.display = 'none'
  const num_ot = Math.min(outcomes.length, document.getElementById("number-of-outcomes").value)
  const num_inter = Math.min(interventions.length, document.getElementById("number-of-intervention-types").value)
  grid.insertAdjacentHTML("afterbegin", `<div style="border:thin solid lightgrey;padding:3px;">Intervention/Outcome</div>`)
  for (let j = 0; j < num_ot; j++) {
    const cell = document.createElement("div")
    cell.textContent = outcomes[j]
    cell.style = "border:thin solid lightgrey;font-size:10px;padding:3px;"
    grid.appendChild(cell)
  }
  const other_interventions = []
  for (let i = num_inter; i < interventions.length; i++) {
    other_interventions.push(interventions[i])
  }
  const other_outcomes = []
  for (let j = num_ot; j < outcomes.length; j++) {
    other_outcomes.push(outcomes[j])
  }
  if (num_ot < outcomes.length) {
    interventions.forEach(intervention => {
      data_filtered[intervention].others = trials_with_other_outcomes(data, intervention, other_outcomes)
    })

    grid.style = `display: grid;grid-template-columns: 1fr repeat(${num_ot + 1}, 100px);width: 80%;margin: auto;margin-top: 5px;margin-bottom: 5px;`
    const cell = document.createElement("div")
    cell.textContent = "Other outcomes"
    cell.style = "border:thin solid lightgrey;font-size:10px;padding:3px;"
    grid.appendChild(cell)
  } else {
    grid.style = `display: grid;grid-template-columns: 1fr repeat(${num_ot}, 100px);width: 80%;margin: auto;margin-top: 5px;margin-bottom: 5px;`
  }
  if (num_inter < interventions.length) {
    data_filtered.others = {}
    outcomes.forEach(outcome => {
      data_filtered.others[outcome] = trials_with_other_interventions(data, outcome, other_interventions)
    })
    if (num_ot < outcomes.length) {
      data_filtered.others.others = trials_others_others(data, other_interventions, other_outcomes)
    }
  }
  document.getElementById("primary-dimension").value = "country"
  document.getElementById("secondary-dimension").value = "gender"
  for (let i = 0; i <= num_inter; i++) {
    if (num_inter == interventions.length && i == num_inter) continue // no extra row for 'Other intervention' needed
    const intervention = i < num_inter ? interventions[i] : 'others'
    const cell = document.createElement("div")
    cell.textContent = i < num_inter ? intervention : 'Other interventions'
    cell.style = "border:thin solid lightgrey;padding:3px;"
    grid.appendChild(cell)
    for (let j = 0; j <= num_ot; j++) {
      if (j == num_ot && num_ot == outcomes.length) continue // no extra column for 'Other outcomes' needed

      const outcome = j < num_ot ? outcomes[j] : 'others'
      const value = data_filtered[intervention][outcome].length
      const cell = document.createElement("div")
      cell.style.backgroundColor = get_blue_shade(value, min = 0, max = 2)
      cell.style.border = "thin solid lightgrey"

      const tooltip = document.createElement("div")
      tooltip.setAttribute("data-count", value)
      tooltip.className = "x-tooltip"
      cell.appendChild(tooltip)

      grid.appendChild(cell)

      cell.onclick = (event) => {
        document.getElementById("radial-title").innerHTML = `Population Distribution for ${intervention} / ${outcome})`

        const years = {}

        data_filtered.forEach(t => {
          const year = t.study_dates.start_date.substring(0, 4)
          if (years[year] === undefined) years[year] = 1
          else years[year] += 1
        })
        const count_over_years = []
        for (let y in years) count_over_years.push({ year: y, value: 'count', records: years[y] })

        const dim1 = document.getElementById("primary-dimension").value
        const dim2 = document.getElementById("secondary-dimension").value
        const counts = group_by_2d(data_filtered, dim1, dim2)
        const counts_no_label = [] // for now
        for (let cat1 in counts) {
          const values = Object.values(counts[cat1])
          counts_no_label.push({ category: cat1, values: values })
        }

        popup.style.display = 'flex'
        create_radial_stacked_plot(counts_no_label, "radial-stacked")
        trend_plot(count_over_years, "gap-map-trend")
      }
    }
  }
  document.getElementById("close-button").onclick = () => popup.style.display = 'none'
}

function trials_with_other_outcomes(data, intervention, other_outcomes) {
  const filtered = []
  data.forEach(t => {
    if (!match_intervention(t, intervention)) return
    const all_outcomes_in_one_trial = []
    t.pico_attributes.outcomes.forEach(outcome => {
      for (let key in outcome.concepts) { // concepts[key] is an array
        outcome.concepts[key].forEach(item => {
          if (!all_outcomes_in_one_trial.includes(item.canonical_name))
            all_outcomes_in_one_trial.push(item.canonical_name)
        })
      }
    })
    if (all_outcomes_in_one_trial.some(x => other_outcomes.includes(x)))
      filtered.push(t)
  })
  console.debug("number of trials_with_other_outcomes", filtered.length)
  return filtered
}

function trials_with_other_interventions(data, outcome, other_interventions) {
  const filtered = []
  data.forEach(t => {
    if (!match_outcome(t, outcome)) return
    const all_interventions_in_one_trial = []
    t.pico_attributes.interventions.forEach(intervention => {
      for (let key in intervention.concepts) { // concepts[key] is an array
        intervention.concepts[key].forEach(item => {
          if (!all_interventions_in_one_trial.includes(item.canonical_name))
            all_interventions_in_one_trial.push(item.canonical_name)
        })
      }
    })
    if (all_interventions_in_one_trial.some(x => other_interventions.includes(x)))
      filtered.push(t)
  })
  console.debug("number of trials_with_other_interventions", filtered.length)
  return filtered
}

function trials_others_others(data, other_interventions, other_outcomes) {
  const filtered = []
  data.forEach(t => {
    const all_interventions_in_one_trial = []
    t.pico_attributes.interventions.forEach(intervention => {
      for (let key in intervention.concepts) { // concepts[key] is an array
        intervention.concepts[key].forEach(item => {
          if (!all_interventions_in_one_trial.includes(item.canonical_name))
            all_interventions_in_one_trial.push(item.canonical_name)
        })
      }
    })
    const all_outcomes_in_one_trial = []
    t.pico_attributes.outcomes.forEach(outcome => {
      for (let key in outcome.concepts) { // concepts[key] is an array
        outcome.concepts[key].forEach(item => {
          if (!all_outcomes_in_one_trial.includes(item.canonical_name))
            all_outcomes_in_one_trial.push(item.canonical_name)
        })
      }
    })
    if (all_interventions_in_one_trial.some(x => other_interventions.includes(x)) &&
      all_outcomes_in_one_trial.some(x => other_outcomes.includes(x)))
      filtered.push(t)
  })
  console.debug("number of trials_others_others", filtered.length)
  return filtered
}

// aggregate the data on the frontend
function group_by_2d(filtered_data, primary_dim, secondary_dim) {
  result = {}
  filtered_data.forEach(element => {
    const primary = element.pico_attributes.populations[primary_dim]
    const secondary = element.pico_attributes.populations[secondary_dim]
    const x = result[primary]
    if (x === undefined) result[primary] = {}
    if (result[primary][secondary] === undefined) result[primary][secondary] = 1
    else result[primary][secondary] += 1
  })
  return result
}

// brighter for larger value; lighter color of smaller value
function get_blue_shade(value, min = 0, max = 150) {
  if (value === null) return "lightgray"
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
  if (data.length == 0) return // empty dataset

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
    .attr("transform", `translate(${width / 2},${height / 2})`);

  // create the stack generator
  const sizes = data.map(d => d.values.length)
  const max_size = Math.max(...sizes)
  const keys = []
  for (let k = 0; k < max_size; k++)keys.push(k)
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

// trials filtered by a given intervention and outcome
// make it global to facilitate redraw when the radial-stacked dimension options are changed
let data_filtered = []
function redraw_radial() {
  const dim1 = document.getElementById("primary-dimension").value
  const dim2 = document.getElementById("secondary-dimension").value
  const counts_no_label = [] // for now
  const counts = group_by_2d(data_filtered, dim1, dim2)
  for (let cat1 in counts) {
    const values = Object.values(counts[cat1])
    counts_no_label.push({ category: cat1, values: values })
  }
  create_radial_stacked_plot(counts_no_label, "radial-stacked")
}