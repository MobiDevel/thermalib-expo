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

  s.platform     = :ios, "13.0"
  s.swift_version = "5.0"

  # Expo Modules native sources
  s.source_files = "ios/**/*.{h,m,mm,swift}"

  # Expo Modules Core dependency
  s.dependency "ExpoModulesCore"

  # ---- Link the prebuilt ThermaLib static library ----
  # Keep the .a and headers inside your package at:
  # ios/ThermaLib/libThermaLib.a
  # ios/ThermaLib/include/ThermaLib/*.h
  s.vendored_libraries = "ios/ThermaLib/libThermaLib.a"
  s.preserve_paths     = "ios/ThermaLib/include/**/*"

  # Ensure headers are visible to your Swift/ObjC code
  s.pod_target_xcconfig = {
    # Allow umbrella includes like <ThermaLib/ThermaLib.h>
    "HEADER_SEARCH_PATHS" => "\"$(PODS_TARGET_SRCROOT)/ios/ThermaLib/include\"",
    # ObjC categories from static libs
    "OTHER_LDFLAGS" => "$(inherited) -ObjC"
  }

  # libc++ for C++ symbols in the vendor .a
  s.libraries = "c++"

  # Apple frameworks required by ThermaLib
  s.frameworks = ["CoreBluetooth"]
end
