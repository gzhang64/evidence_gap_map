# Evidence Chart Software Design

This document includes two parts: the description of UI, and the organization of the software constructs. The former itself has two parts: the user interaction, and the overall layout.

## Description of UI

# User interaction

The user starts the inquiry by first selecting some conditions.
The results are all based on the selection of conditions,
and organized as a visualization panel, a tabular panel, and a 'evidence pag map' section, with details in the *Overall layout* section.
Once the user types some text, all the matching conditions are displayed. If the user select one of the condition, it is added to the the list of conditions,
based on which the inquiry will be carried out. When the user press the *Search* button, the plots and results will be generated.

# Overall layout

The visualization includes a main part of two panels side-by-side: plots on the left side and the tabular panel on the right side. After the main part, there is an 'evidence gap mapping' section.
The left panel, namely all the main plots, are grouped into two tabs. Each of the tab has a group of 7 plots, each corresponding to the counterpart in the other tab. The first tab is about the total number of trials, and the second tab is about the trend of change over years.
  1. count of countries
  2. count of minimum age groups
  3. count of maximum age groups
  4. gender distribution
  5. intervention type distribution
  6. top 20 interventions
  7. top 20 outcomes

The evidence gap mapping shows a grid visualizing the number of trials for each combination of intervention and outcome after the user clicks a button to show this grid. Then the user can click a cell in the grid to explore details for that combination. Specifically, th pop-up box will show two plots: a radial-stacked plot showing the distribution for two dimensions out of 4 population parameters, which the user can further interactively choose from, and a trend plot to show the change of total number of trials over years.

## Software constructs

The system is made of two part: the backend data service API, and the frontend web application.

### backend
The backend data service is implement using Python flask. The code is the directory `backend_flask`.

There are two endpoints:
1. /api/conditions: get all distinct conditions
2. /api/search_trials: get study info for given conditions

### front end
The frontend app is is basically static content that can be served by any web server. We use python built-in http server to do this during development. The content if in the direction `frontend`.

The implementation of various plots are mainly organized by the types of the plots:
1. stacked trend chart: in file dual-trend.js, used in 7 plots
2. vertical bar chart:  in file bar-charts.js, used in two plots
3. horizontal bar chart: in file bar-charts.js, used in one plot
4. line plot (trend plot): in file trend-plots.js, used in one plot
5. donut chart: in file donut-charts.js, used in two plots
6. geographical map: in file evidencechart.js, used in one plot
7. evidence gap map: in file gap-map.js, implementation of the interactive 'evidence gap map'

`evidencechart.js` is also the main script file that uses other scripts, and implements the user interaction workflow.

---
Some of the details here are description of what it is now. It is up to modification or re-designing.