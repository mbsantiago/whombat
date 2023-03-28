#!/bin/bash
# Description: Starts the frontend development server

# Load environment variables for development
source scripts/dev_env.sh

cd front

# Run the development server
pnpm run dev
