#!/bin/bash
# Description: Starts the frontend development server

# Load environment variables for development
source scripts/dev_env.sh

# Move to the root directory of the frontend
cd front

# Run the development server
npm run dev
