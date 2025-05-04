#!/bin/sh

if [ "$1" = "development" ]; then
  echo "Starting in development mode..."
  npm start
elif [ "$1" = "server" ]; then
  echo "Starting only the Express server..."
  node server.js
else
  echo "Starting in production mode..."
  # Serve the built React app and run the Express server
  node server.js
fi 