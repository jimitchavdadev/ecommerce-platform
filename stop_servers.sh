#!/bin/bash

# This script safely stops processes running on specified ports.

PORTS_TO_STOP=("3000" "3001")

for port in "${PORTS_TO_STOP[@]}"; do
  echo "---"
  echo "Checking port $port..."

  # Find the Process ID (PID) using the specified port
  PID=$(lsof -t -i:$port)

  # Check if a PID was found
  if [ -z "$PID" ]; then
    echo "✅ No process found on port $port."
  else
    echo "▶️  Process found with PID: $PID. Stopping it now..."
    kill -9 $PID
    echo "✅ Process on port $port stopped."
  fi
done

echo "---"
echo "All done."
