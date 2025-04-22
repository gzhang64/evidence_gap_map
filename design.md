# Evidence Chart Software Design

This document includes two parts: the description of UI, and the organization of the software constructs. The former itself has two parts: the user interaction, and the overall layout.

## Description of UI

# User interaction

The user starts the inquiry by first selecting (1) an intervention type, or (2) some conditions. The results and visualization are also shown in the two separated part, with details in the *Overall layout* section.

For intervention type, once the user types some text, as little as one letter, all the matching intervention types are displayed. If the user select one of the intervention type, the plots are generated.

For the condition, once the user types some text, all the matching conditions are displayed. If the user select one of the condition, it is added to the the list of conditions,
based on which the inquiry will be carried out. When the user press the *Search* button, the plots and results will be generated.

In both cases, the results are about the number of studies matching the inquiry criterion.

# Overall layout

For intervention type inquiry, there are two plots. They are displayed side by side: one for count, another for percentage.

For condition inquiry, the plots are grouped into the following sections:
- a group of three plot
- a plot for
- a group of 7 pairs of plots. Each pair includes a variety of types of plot on the left, and a corresponding the trend plot on the right.
  1. global count
  2. minimum gae
  3. maximum age
  4. gender distribution
  5. intervention type distribution
  6. top 20 intervention types
  7. top 20 outcomes

## Software constructs

The system is made of two part: the backend data service API, and the frontend web application.

### backend
The backend data service is implement using Python flask. The code is the directory `backend_flask`.

There are 4 endpoints:
1. /api/conditions: get all distinct conditions
2. /api/intervention-types: get all distinct intervention types
3. /api/search_trials: get study info for given conditions
4. /api/count-by-conditions/<intervention>: count trials grouped by conditions

### front end
The frontend app is is basically static content that can be served by any web server. We use python built-in http server to do this during development. The content if in the direction `frontend`.

The implementation of various plots are mainly organized by the types of the plots:
1. stacked bar chart: in file stacker-bars.js, used in 6 plots
2. vertical bar chart:  in file bar-charts.js, used in two plots
3. horizontal bar chart: in file bar-charts.js, used in one plot
4. line plot (trend plot): in file trend-plots.js, used in 7 plots
5. donut chart: in file donut-charts.js, used in two plots
6. geographical map: in file evidencechart.js, used in one plot

`evidencechart.js` is also the main script file that uses other scripts, and implements the user interaction workflow.

---
Some of the details here are description of what it is now. It is up to modification or re-designing.