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

  # ⚠️ Only your Expo module sources, not Pods
  s.source_files  = "ios/ThermalibExpoModule.swift" 
  s.exclude_files = "ios/**/AppDelegate.*", "ios/**/SceneDelegate.*", "ios/**/main.*", "ios/**/Info.plist", "ios/Pods/**/*", "ios/build/**/*"

  # Expo module runtime
  s.dependency "ExpoModulesCore"

  # Vendored ThermaLib static lib + public headers
  s.vendored_libraries = "ios/ThermaLib/libThermaLib.a"
  s.preserve_paths     = "ios/ThermaLib/include/**/*"
  s.pod_target_xcconfig = {
    'HEADER_SEARCH_PATHS' => '"$(PODS_TARGET_SRCROOT)/ios/ThermaLib/include"',
    'OTHER_LDFLAGS'       => '$(inherited) -ObjC'
  }
  s.libraries = "c++"
  s.frameworks = ["CoreBluetooth"]
end