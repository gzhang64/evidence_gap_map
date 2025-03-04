#!/bin/bash

# Set the MongoDB database and collection name
DATABASE="researchgap"
COLLECTION="aact"

# Set the directory containing your JSON files
DIRECTORY="./data_for_mongodb/"

# Loop through all JSON files in the directory and import them
for file in "$DIRECTORY"*.json; do
  echo "Importing $file..."
  mongoimport --db "$DATABASE" --collection "$COLLECTION" --file "$file" --jsonArray
done

echo "All files have been imported successfully."
