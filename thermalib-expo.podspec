# thermalib-expo.podspec
require 'json'
package = JSON.parse(File.read(File.join(__dir__, 'package.json'))) rescue {}

Pod::Spec.new do |s|
  s.name         = "thermalib-expo"
  s.version      = package["version"] || "0.1.0"
  s.summary      = package["description"] || "Expo wrapper for ThermaLib (BLE thermometer SDK)"
  s.license      = package["license"] || "MIT"
  s.authors      = package["author"] || { "Author" => "thomas.hagstrom@mobione.com" }
  s.homepage     = (package["homepage"] || "https://github.com/MobiDevel/thermalib-expo").to_s

  # When publishing, you can switch to a git source with tags.
  s.source       = { :path => "." }

  s.platform      = :ios, "13.0"
  s.swift_version = "5.0"

  s.static_framework = true

  # Only your Expo module Swift files
  s.source_files  = "ios/**/*.{swift}"
  s.exclude_files = "ios/**/AppDelegate.*", "ios/**/SceneDelegate.*", "ios/**/main.*", "ios/**/Info.plist", "ios/Pods/**/*", "ios/build/**/*"

  # Expo runtime
  s.dependency "ExpoModulesCore"

  # Vendored SDK
  s.vendored_libraries = "ios/ThermaLib/libThermaLib.a"

  # Expose headers; let CocoaPods generate the module named "ThermaLib"
  s.public_header_files = "ios/ThermaLib/include/ThermaLib/*.h"
  s.header_mappings_dir = "ios/ThermaLib/include"
  s.module_name         = "ThermaLib"

  # One-shot assignment (no `.merge`)
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES' => 'YES',
    'OTHER_LDFLAGS' => '$(inherited) -ObjC -lc++'
  }

  s.frameworks = ['CoreBluetooth']
end