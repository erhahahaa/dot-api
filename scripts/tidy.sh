#!/bin/bash

cd "$(dirname "$0")/.." || exit

for dir in */; do
  if [ -d "$dir" ]; then
    if [ -f "$dir/go.mod" ]; then
      echo "Found go.mod in $dir"
      cd "$dir" || continue
      echo "Running go mod tidy in $dir"
      go mod tidy
      echo "Running go mod verify in $dir"
      go mod verify
      cd ..
    fi
  fi
done

echo "Script completed."
