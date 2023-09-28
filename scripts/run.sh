#!/bin/bash
# Description: Run whombat

# Go to the backend directory
cd back

echo "Starting whombat..."

# Run whombat. This assumes that whombat is already installed
python -m whombat >whombat.log 2>&1 &
serverPID=$!

# Wait for up to 8 seconds for the service to be ready.
for attempt in $(seq 1 8); do
	sleep 1
	if grep -q "Application startup complete" whombat.log; then
		echo "start up complete."
		break
	fi
	if [[ attempt -eq 5 ]]; then
		echo "Error launching whombat - see 'whombat.log' for command output."
		exit
	fi
done

xdg-open http://localhost:5000

tail -f whombat.log
