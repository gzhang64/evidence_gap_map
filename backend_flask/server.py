from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from flask_cors import CORS

# Initialize Flask application
app = Flask(__name__)
CORS(app, origins=["http://localhost:8000"])

# Configure MongoDB connection
app.config["MONGO_URI"] = "mongodb://localhost:27017/researchgap"
mongo = PyMongo(app)

# Access the "items" collection in the MongoDB database
trials_collection = mongo.db.aact

# Route to get distinct conditions
@app.route('/api/conditions', methods=['GET'])
def get_distinct_conditions():
    # Aggregation pipeline to extract distinct canonical_name values
    pipeline = [
        {"$project": {
            "conditions": "$pico_attributes.populations.conditions"
        }},
        {"$unwind": "$conditions"},
        {"$project": {
            "concepts": {"$objectToArray": "$conditions.concepts"}
        }},
        {"$unwind": "$concepts"},
        {"$replaceRoot": {
            "newRoot": {"$arrayElemAt": ["$concepts.v", 0]}
        }},
        {"$project": {
            "canonical_name": 1
        }},
        {"$group": {
            "_id": "$canonical_name"
        }},
        {"$sort": {"_id": 1}}  # Optional: sort alphabetically
    ]

    # Run aggregation
    results = trials_collection.aggregate(pipeline)
    # Extract and print distinct canonical_names
    if results:
        distinct_canonical_names = map(lambda x: x["_id"], results)
        return jsonify(distinct_canonical_names)
    else:
        print("No canonical_names found.")
        return jsonify([])

@app.route('/api/search_trials', methods=['POST'])
def search_trials():
    # Receive the selected condition groups from the frontend
    data = request.json
    selected_groups = data.get("selectedGroups", [])

    # Construct MongoDB query for conditions
    query_conditions = []
    for group in selected_groups:
        group_query = {"concepts_array.v.canonical_name": {"$all": group}}  # Each group is an AND clause
        query_conditions.append(group_query)

    # Use an OR query for multiple groups
    query = {"$or": query_conditions} if query_conditions else {}

    pipeline = [
        # Unwind populations and conditions
        {"$unwind": "$pico_attributes.populations"},
        {"$unwind": "$pico_attributes.populations.conditions"},
        # Convert `concepts` object to array of {k: key, v: array} pairs
        {"$addFields": {
            "concepts_array": {"$objectToArray": "$pico_attributes.populations.conditions.concepts"}
        }},
        # Unwind the concepts array (now [{k: "ALL", v: [...]}, ...])
        {"$unwind": "$concepts_array"},
        # Unwind the nested concept arrays (e.g., "ALL": [...])
        {"$unwind": "$concepts_array.v"},
        # Match the target canonical_name
        {"$match": query},
        # Group back to original documents
        {"$group": {
            "_id": "$_id",
            "nct_id": {"$first": "$nct_id"},
            "title": {"$first": "$title"},
            "pico_attributes": {"$first": "$pico_attributes"},
            "study_dates": {"$first": "$study_dates"}
        }},
        { "$sort": { "title": 1 } },
    ]
    # apparently aggregate operation is asynchronous
    # so even if sorting is not required, it helps keeping the result in a deterministic order

    matching_trials = list(trials_collection.aggregate(pipeline))
    return jsonify(matching_trials)

# Start the Flask server
if __name__ == '__main__':
    app.run(debug=True)
