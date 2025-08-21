# thermalib-expo.podspec
require 'json'
package = JSON.parse(File.read(File.join(__dir__,'..', 'package.json'))) 

Pod::Spec.new do |s|
  s.name         = "thermalib-expo"
  s.version      = package["version"] || "0.1.0"
  s.summary      = package["description"] || "Expo wrapper for ThermaLib (BLE thermometer SDK)"
  s.license      = package["license"] || "MIT"
  s.authors      = package["author"] || { "Author" => "thomas.hagstrom@mobione.com" }
  s.homepage     = (package["homepage"] || "https://github.com/MobiDevel/thermalib-expo").to_s

  s.platforms      = {
    :ios => '15.1',
    :tvos => '15.1'
  }
  s.swift_version  = '5.4'

  s.source         = { git: 'https://github.com/MobiDevel/thermalib-expo.git' }
  s.static_framework = true

  # Only your Expo module Swift files
  s.source_files  = "**/*.{swift}"
  s.exclude_files = "**/AppDelegate.*", "**/SceneDelegate.*", "**/main.*", "**/Info.plist", "**/Pods/**/*", "**/build/**/*"

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  # Expo runtime
  s.dependency "ExpoModulesCore"

  # Vendored SDK
  s.vendored_libraries = "ThermaLib/libThermaLib.a"

  # Expose headers for the vendored ThermaLib library. If ThermaLib needs
  # its own Swift module, consider a subspec or separate pod to avoid
  # conflicts.
  s.public_header_files = "ThermaLib/include/ThermaLib/*.h"
  s.header_mappings_dir = "ThermaLib/include"

  s.frameworks = ['CoreBluetooth']
end
