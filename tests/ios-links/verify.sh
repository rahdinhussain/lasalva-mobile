#!/bin/bash
set -euo pipefail
device=$1
artifacts=$2
bundle=com.lasalva.mobile
mkdir -p "$artifacts"
swiftc tests/ios-links/screen.swift -o "$RUNNER_TEMP/lasalva-read-screen"

check_reset_form() {
  local name=$1
  for attempt in $(seq 1 12); do
    xcrun simctl io "$device" screenshot "$artifacts/$name.png" >/dev/null 2>&1
    "$RUNNER_TEMP/lasalva-read-screen" "$artifacts/$name.png" > "$artifacts/$name.txt"
    if grep -Fqi 'Confirm password' "$artifacts/$name.txt" && grep -Fqi 'New password' "$artifacts/$name.txt"; then
      echo "Reset page displayed after $name URL delivery"
      return 0
    fi
    sleep 1
  done
  echo "Screen observed after $name URL delivery:"
  cat "$artifacts/$name.txt"
  return 1
}

# Use the simulator's system URL handler, the same path an external app takes.
xcrun simctl terminate "$device" "$bundle" 2>/dev/null || true
xcrun simctl openurl "$device" 'lasalva://reset-password?token=cold-fixture'
cold=0
check_reset_form cold || cold=$?
xcrun simctl terminate "$device" "$bundle"
xcrun simctl launch "$device" "$bundle"
for attempt in $(seq 1 15); do
  xcrun simctl io "$device" screenshot "$artifacts/home.png" >/dev/null 2>&1
  if "$RUNNER_TEMP/lasalva-read-screen" "$artifacts/home.png" | grep -Fqi 'Welcome back'; then break; fi
  sleep 1
done
xcrun simctl openurl "$device" 'lasalva://reset-password?token=warm-fixture'
warm=0
check_reset_form warm || warm=$?
test "$cold" = 0 && test "$warm" = 0
