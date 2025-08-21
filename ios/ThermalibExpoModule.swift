//
//  ThermalibExpoModule.swift
//  ThermalibExpo
//
//  Created by Thomas Hagström on 2025-08-20.
//

import Foundation
import ExpoModulesCore

// Reuse the SDK singleton lazily
private let TL = ThermaLib.sharedInstance()!

public class ThermalibExpoModule: Module {
  private var hasListeners = false
  private var deviceList: [any TLDevice] = []

  public func definition() -> ModuleDefinition {
    Name("ThermalibExpo")

    // Events JS can subscribe to (must match JS listener)
    Events("onChange")

    OnStartObserving {
      self.hasListeners = true
    }
    OnStopObserving {
      self.hasListeners = false
    }

    // ---- JS API ----

    // Kick off SDK config + observers (call AFTER adding the listener)
    Function("initThermaLib") {
      TL.setSupportedTransports([NSNumber(value: TLTransport.bluetoothLE.rawValue)])
      NotificationCenter.default.addObserver(
        self,
        selector: #selector(self.scanCompleted(_:)),
        name: NSNotification.Name(rawValue: ThermaLibScanCompletedNotificationName),
        object: nil
      )
      NotificationCenter.default.addObserver(
        self,
        selector: #selector(self.newDeviceFound(_:)),
        name: NSNotification.Name(rawValue: ThermaLibNewDeviceFoundNotificationName),
        object: nil
      )
      NotificationCenter.default.addObserver(
        self,
        selector: #selector(self.deviceUpdated(_:)),
        name: NSNotification.Name(rawValue: ThermaLibDeviceUpdatedNotificationName),
        object: nil
      )
      self.emit("Init ThermaLib")
    }

    // Start a BLE scan
    AsyncFunction("startScanning") { () -> Void in
      self.emit("BT available: \(TL.isBluetoothAvailable())")
      if !TL.isBluetoothAvailable() {
        self.emit("No bluetooth!")
        return
      }
      self.emit("Starting to scan")
      TL.stopDeviceScan()
      TL.removeAllDevices()
      TL.startDeviceScan(with: .bluetoothLE, retrieveSystemConnections: true)
    }

    // Return current devices (sync)
    Function("devices") { () -> [[String: Any]]? in
      self.refreshDeviceList()
      if self.deviceList.isEmpty { return nil }
      return self.deviceList.map { self.convertDevice($0) }
    }

    // Connect/find device by id (sync)
    Function("readDevice") { (deviceId: String) -> [String: Any] in
      var result: [String: Any] = [:]
      self.refreshDeviceList()
      guard let dev = self.deviceList.first(where: { $0.deviceIdentifier == deviceId }) else {
        self.emit("Found no match for \(deviceId)")
        return result
      }
      TL.connect(to: dev)
      result["device"] = self.convertDevice(dev)
      return result
    }

    // Read temperature from first sensor (async on main thread)
    AsyncFunction("readTemperature") { (deviceId: String) -> [String: Any] in
      return try await MainActor.run {
        var result: [String: Any] = [:]
        guard let device = TL.device(withIdentifier: deviceId, transport: .bluetoothLE) else {
          self.emit("Found no match for \(deviceId)")
          return result
        }
        guard let first = device.sensors.first else {
          self.emit("Found no sensors on device \(deviceId)")
          return result
        }
        let reading = first.reading
        self.emit("Read device. Value: \(reading)")
        result["reading"] = reading
        return result
      }
    }
  }

  // ---- Helpers / Notifications ----

  private func refreshDeviceList() {
    if let list = TL.deviceList() {
      deviceList = list
    }
  }

  private func convertDevice(_ dev: TLDevice) -> [String: Any] {
    var map: [String: Any] = [:]
    map["identifier"] = dev.deviceIdentifier ?? ""
    map["deviceName"] = dev.deviceName ?? ""
    map["connectionState"] = "\(dev.connectionState)"
    map["modelNumber"] = dev.modelNumber ?? ""
    map["manufacturerName"] = dev.manufacturerName ?? ""
    map["batteryLevel"] = dev.batteryLevel
    map["description"] = dev.description
    map["deviceType"] = dev.deviceTypeName ?? ""
    return map
  }

  private func emit(_ msg: String) {
    guard hasListeners else { return }
    sendEvent("onChange", ["message": msg])
  }

  @objc private func scanCompleted(_ notification: Notification) {
    let count = TL.deviceList().count
    emit("\(count) found in scan")
    refreshDeviceList()
  }

  @objc private func newDeviceFound(_ notification: Notification) {
    if let device = notification.object as? TLDevice {
      emit("New device found: \(device.deviceName ?? "")")
      refreshDeviceList()
    }
  }

  @objc private func deviceUpdated(_ notification: Notification) {
    if let device = notification.object as? TLDevice {
      emit("Device \(device.deviceIdentifier ?? "") updated")
    }
  }
}
