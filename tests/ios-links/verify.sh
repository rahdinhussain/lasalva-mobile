#!/bin/bash
set -euo pipefail
device=$1
artifacts=$2
mkdir -p "$artifacts"
project="$RUNNER_TEMP/LasalvaLinkChecks.xcodeproj"
ruby tests/native-ios/project.rb "$project"
if xcodebuild test -project "$project" -scheme RecoveryUITests -configuration Release \
  -destination "id=$device" -derivedDataPath "$RUNNER_TEMP/lasalva-link-tests" \
  -resultBundlePath "$artifacts/RecoveryUITests.xcresult" -parallel-testing-enabled NO \
  ARCHS=arm64 ONLY_ACTIVE_ARCH=YES > "$RUNNER_TEMP/lasalva-form-checks.log"; then
  grep -E "Test Case.*passed|Executed [0-9]+ tests" "$RUNNER_TEMP/lasalva-form-checks.log" | tail -10
else
  grep -E "error:|Test Case.*failed|XCTAssert|Executed [0-9]+ tests" "$RUNNER_TEMP/lasalva-form-checks.log" | tail -30 || true
  xcrun simctl io "$device" screenshot "$artifacts/screen.png"
  swift tests/ios-links/screen.swift "$artifacts/screen.png" > "$artifacts/screen.txt" || true
  exit 1
fi
