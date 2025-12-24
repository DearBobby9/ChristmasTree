#!/bin/bash

# Ensure we are in the script's directory
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the dev server
echo "Starting development server..."
npm run dev -- --open
