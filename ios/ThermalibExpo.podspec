require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = "thermalib-expo"
  s.version      = package["version"]
  s.summary      = package["description"] || "Expo wrapper for ThermaLib"
  s.license      = package["license"] || "MIT"
  s.author       = package["author"] || "MobiDevel"
  s.homepage     = package["homepage"] || "https://github.com/thomashagstrom/thermalib-expo"
  s.source       = { :git => package["repository"] ? package["repository"]["url"] : "" , :tag => "#{s.version}" }

  s.platforms    = { :ios => "13.0" }
  s.source_files = "ios/**/*.{h,m,mm,swift}"

  # Swift support
  s.swift_version = '5.0'

  # Expo Modules Core
  s.dependency "ExpoModulesCore"

  # Link ThermaLib static lib + headers (adjust paths if needed)
  s.vendored_libraries = "ios/ThermaLib/libThermaLib.a"
  s.preserve_paths     = "ios/ThermaLib/include/**"
  s.pod_target_xcconfig = {
    'HEADER_SEARCH_PATHS' => '"$(PODS_TARGET_SRCROOT)/ios/ThermaLib/include"',
    'OTHER_LDFLAGS' => '$(inherited) -ObjC -lc++'
  }

  # Required Apple frameworks
  s.frameworks = ['CoreBluetooth']
end
