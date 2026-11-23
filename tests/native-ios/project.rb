# Build a tiny external link sender and UI tests alongside the compiled Lasalva app.
require 'xcodeproj'
project_path = ARGV.fetch(0)
project = Xcodeproj::Project.new(project_path)
source = project.new_target(:application, 'LinkSource', :ios, '17.0')
tests = project.new_target(:ui_test_bundle, 'RecoveryUITests', :ios, '17.0')
tests.add_dependency(source)
[[source, 'LinkSource.swift', 'com.lasalva.qa.linksource'],
 [tests, 'RecoveryUITests.swift', 'com.lasalva.qa.RecoveryUITests']].each do |target, file, bundle|
  reference = project.main_group.new_file(File.join(__dir__, file))
  target.source_build_phase.add_file_reference(reference)
  target.build_configurations.each do |configuration|
    settings = configuration.build_settings
    settings['PRODUCT_NAME'] = '$(TARGET_NAME)'
    settings['PRODUCT_MODULE_NAME'] = target.name
    settings['PRODUCT_BUNDLE_IDENTIFIER'] = bundle
    settings['SWIFT_VERSION'] = '5.0'
    settings['GENERATE_INFOPLIST_FILE'] = 'YES'
    settings['TARGETED_DEVICE_FAMILY'] = '1,2'
    if target == tests
      settings['TEST_TARGET_NAME'] = source.name
    else
      settings['INFOPLIST_KEY_UILaunchScreen_Generation'] = 'YES'
    end
  end
end
project.save
scheme = Xcodeproj::XCScheme.new
scheme.add_build_target(source)
scheme.add_test_target(tests)
scheme.set_launch_target(source)
scheme.save_as(project_path, 'RecoveryUITests', true)
