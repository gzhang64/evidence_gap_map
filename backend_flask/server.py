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
