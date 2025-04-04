function suggest_intervention_types(input) {
    const container = document.getElementById('autocomplete-intervention-type');
    container.innerHTML = ''; // Clear previous suggestions
    if (!input) return; // If no input, exit

    get_intervention_types().then(intervention_types => {
        const suggestions = intervention_types.filter(t =>
            t.toLowerCase().startsWith(input.toLowerCase())
        );
    
        suggestions.forEach(suggestion => {
            const div = document.createElement('div');
            div.classList.add('autocomplete-item');
            div.innerText = suggestion;
            div.onclick = () => plot_intervention_condition(suggestion);
            container.appendChild(div);
        });
      })
      .catch(error => {
        console.error("Error:", error);
      });
}

async function get_intervention_types() {
    console.time("get_intervention_types")
    try {
        const response = await fetch('http://127.0.0.1:5000/api/intervention-types')
        if (!response.ok) throw new Error("Failed to get intervention types")
        const intervention_types = await response.json()
        return intervention_types
    } catch (error) {
        console.error("Error getting intervention types", error)
    } finally {
        console.timeEnd("get_intervention_types")
    }
}

// convert the data part to an array
function convert(result) {
    const data = []
    for(year in result.data) {
        const item = {...result.data[year]} // make a copy so we can reuse the orginal result
        item.year = year
        data.push(item)
    }
    return {groups: result.groups, data: data}
}

function percentage(result) {
    const data = []
    for(year in result.data) {
        const item = {...result.data[year]}
        const sum = Object.values(item).reduce((sum, x) => sum+x)
        for(let x in item) {
             item[x] *= 100/sum
        }
        item.year = year
        data.push(item)
    }
    return {groups: result.groups, data: data}
}

function plot_intervention_condition(intervention) {
    try {
        fetch(`http://127.0.0.1:5000/api/count-by-conditions/${intervention}`).then(response => {
            response.json().then(x=>{
                stacked_bars(x, convert, "intervention-condition-count", 'count', `Conditions Studied with ${intervention} Over Time`)
                stacked_bars(x, percentage, "intervention-condition-percentage", 'percentage', `Conditions Studied with ${intervention} Over Time`)
            })
        }).catch(error => {
            console.error("Error:", error);
          });
    } catch (error) {
        console.error("Error counting by intervention+conditions", error)
    }
}