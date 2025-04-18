from functools import reduce
from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from bson.objectid import ObjectId  # For working with MongoDB ObjectIds
from flask_cors import CORS

# Initialize Flask application
app = Flask(__name__)
CORS(app, origins=["http://localhost:8000"])

# Configure MongoDB connection
app.config["MONGO_URI"] = "mongodb://localhost:27017/researchgap"
mongo = PyMongo(app)

# Access the "items" collection in the MongoDB database
trials_collection = mongo.db.aact

# get distinct intervention types
@app.route('/api/intervention-types', methods=['GET'])
def get_distinct_intervention_types():
    intervention_types = trials_collection.distinct("pico_attributes.interventions.type")
    return jsonify(sorted(intervention_types))

# count trials for all intervention types and outcomes
@app.route('/api/total', methods=['GET'])
def total():
    counts = trials_collection.aggregate([
        { "$unwind": "$pico_attributes.interventions" },
        { "$unwind": "$pico_attributes.outcomes" },
        { "$group": { "_id": {
            "intervention": "$pico_attributes.interventions.type", 
            "outcome": "$pico_attributes.outcomes", }, "count": { "$sum": 1 } } },
        {
            "$project": {
                "intervention": "$_id.intervention",
                "outcome": "$_id.outcome",
                "count": 1,
                "_id": 0  # exclude the default _id field
            }
        },
        { "$sort": { "year": 1 } }
    ])

    return jsonify(counts)

# count trials over years given intervention type and outcome
@app.route('/api/count/<intervention>/<outcome>', methods=['GET'])
def count(intervention, outcome):
    print(intervention, outcome)
    counts = trials_collection.aggregate([
        { "$match": {"pico_attributes.outcomes": outcome, "pico_attributes.interventions.type": intervention} },
        # group by year. count
        { "$group": { "_id": { "time": "$time" }, "count": { "$sum": 1 } } },
        {
            "$project": {
                "year": "$_id.time",
                "count": 1,
                "_id": 0  # exclude the default _id field
            }
        },
        { "$sort": { "year": 1 } }
    ])

    # counts is an one-time iterable (pymongo.synchronous.command_cursor.CommandCursor). not something  like a plain list
    result = []
    for item in counts:
        result.append(item)
    return jsonify(result)

# TODO it is a major trade-off between querying on the backend and doing it on the frontend
# retrieve trials by intervention+outcome for further aggregation and counting
@app.route('/api/trials/<intervention>/<outcome>', methods=['GET'])
def get_trials_by_intervention_outcome(intervention, outcome):
    # aggregate over time
    # do not aggregate over population. intended to aggregate by different groups on the frontend
    # strip properties not needed for aggregation. intended for counting only.
    counts = trials_collection.aggregate([
        { "$match": {"pico_attributes.outcomes": outcome, "pico_attributes.interventions.type": intervention} },
        # group by year. count
        { "$group": { "_id": { "condition": "$conditions",
                              "country": "$pico_attributes.populations.country",
                               "gender": "$pico_attributes.populations.gender" }, "count": { "$sum": 1 } } },
        {
            "$project": {
                "condition": "$_id.condition",
                "country": "$_id.country",
                "gender": "$_id.gender",
                "count": 1,
                "_id": 0  # exclude the default _id field
            }
        }
    ])

    result = []
    for item in counts:
        result.append(item)
    return result

# count trials grouped by conditions
@app.route('/api/count-by-conditions/<intervention>', methods=['GET'])
def count_intervention(intervention):
    counts = trials_collection.aggregate([
        { "$match": {"pico_attributes.interventions.type": intervention} },
        # unwind the conditions array (because conditions are stored as arrays)
        { "$unwind": "$conditions" },
        # group by condition and count
        { "$group": { "_id": { "time": "$time", "condition": "$conditions" }, "count": { "$sum": 1 } } },
        # optional: Sort by count (descending)
        { "$sort": { "count": -1 } },
        # reshape the output for readability
        {
            "$project": {
                "year": "$_id.time",
                "condition": "$_id.condition",
                "count": 1,
                "_id": 0  # Exclude the default _id field
            }
        }
    ])

    def rec(result, item):
        year = item["year"]
        condition = item["condition"]
        result["groups"].add(condition)
        count = item["count"]
        groups = result["data"]
        if groups.get(year) is None:
            groups[year] = {condition: count}
        else:
            groups[year][condition] = count
        return result
    result = reduce(rec, counts, {"groups": set(), "data":{}})
    return jsonify(result)

# Route to get distinct conditions
@app.route('/api/conditions', methods=['GET'])
def get_distinct_conditions():
    distinct_conditions = trials_collection.distinct("conditions")
    flattened_conditions = {
        condition 
        for condition in distinct_conditions 
    }
    return jsonify(sorted(flattened_conditions))

@app.route('/api/search_trials', methods=['POST'])
def search_trials():
    # Receive the selected condition groups from the frontend
    data = request.json
    selected_groups = data.get("selectedGroups", [])

    # Construct MongoDB query for conditions
    query_conditions = []
    for group in selected_groups:
        group_query = {"conditions": {"$all": group}}  # Each group is an AND clause
        query_conditions.append(group_query)

    # Use an OR query for multiple groups
    query = {"$or": query_conditions} if query_conditions else {}

    # Query the database with the constructed query
    matching_trials = list(trials_collection.find(query, {"_id": 0}))
    return jsonify(matching_trials)

# Start the Flask server
if __name__ == '__main__':
    app.run(debug=True)
