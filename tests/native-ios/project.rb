# Add the UI test target to the generated project so it runs against the actual Expo app.
require 'xcodeproj'
root = File.expand_path('../..', __dir__)
project_path = File.join(root, 'ios/Lasalva.xcodeproj')
project = Xcodeproj::Project.open(project_path)
app = project.targets.find { |target| target.name == 'Lasalva' }
abort 'Lasalva app target missing' unless app
test = project.new_target(:ui_test_bundle, 'RecoveryUITests', :ios, '17.0')
test.add_dependency(app)
source = project.main_group.new_file(File.join(__dir__, 'RecoveryUITests.swift'))
test.source_build_phase.add_file_reference(source)
test.build_configurations.each do |configuration|
  settings = configuration.build_settings
  settings['PRODUCT_BUNDLE_IDENTIFIER'] = 'com.lasalva.qa.RecoveryUITests'
  settings['TEST_TARGET_NAME'] = app.name
  settings['SWIFT_VERSION'] = '5.0'
  settings['GENERATE_INFOPLIST_FILE'] = 'YES'
  settings['TARGETED_DEVICE_FAMILY'] = '1,2'
end
project.save
scheme = Xcodeproj::XCScheme.new
scheme.add_build_target(app)
scheme.add_test_target(test)
scheme.set_launch_target(app)
scheme.save_as(project_path, 'RecoveryUITests', true)
