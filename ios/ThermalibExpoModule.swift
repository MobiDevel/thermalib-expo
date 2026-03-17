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
  private var isInitialized = false

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
      self.initializeThermaLibIfNeeded()
    }

    // Start a BLE scan
    AsyncFunction("startScanning") { () -> Void in
      self.initializeThermaLibIfNeeded()
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
      self.initializeThermaLibIfNeeded()
      self.refreshDeviceList()
      if self.deviceList.isEmpty { return nil }
      return self.deviceList.map { self.convertDevice($0) }
    }

    // Return device by id and connect it if needed.
    Function("readDevice") { (deviceId: String) -> [String: Any]? in
      self.initializeThermaLibIfNeeded()
      self.refreshDeviceList()
      guard let dev = self.deviceList.first(where: { $0.deviceIdentifier == deviceId }) else {
        self.emit("Found no match for \(deviceId)")
        return nil
      }
      TL.connect(to: dev)
      return self.convertDevice(dev)
    }

    // Explicitly connect to a device
    AsyncFunction("connectDevice") { (deviceId: String) -> Void in
      self.initializeThermaLibIfNeeded()
      self.refreshDeviceList()
      guard let device = self.deviceList.first(where: { $0.deviceIdentifier == deviceId }) else {
        self.emit("connectDevice: No device found for id \(deviceId)")
        return
      }

      TL.connect(to: device)
      self.emit("connectDevice: Successfully connected to device \(deviceId)")
    }

    // Read temperature from first sensor (async on main thread)
    AsyncFunction("readTemperature") { (deviceId: String) -> [String: Any] in
      self.initializeThermaLibIfNeeded()
      return await MainActor.run {
        var result: [String: Any] = [:]
        let msg = "readTemperature: try to read device id \(deviceId)"
        self.emit(msg)

        // Refresh device list to get latest state
        self.refreshDeviceList()
        guard let device = self.deviceList.first(where: { $0.deviceIdentifier == deviceId }) else {
          self.emit("readTemperature: No device found for id \(deviceId) after refresh")
          return result
        }

        // Check connection state if available
        if let state = (device as? NSObject)?.value(forKey: "connectionState") as? Int {
          self.emit("readTemperature: Device \(deviceId) connection state = \(state)")
          if state != 2 && state != 3 { // Treat state=3 as valid
            self.emit("readTemperature: Device \(deviceId) not connected (state=\(state)) after refresh")
            return result
          }
        } else {
          self.emit("readTemperature: Unable to determine connection state for device \(deviceId)")
        }

        guard let sensors = device.sensors, sensors.count > 0 else {
          self.emit("readTemperature: No sensors found on device \(deviceId)")
          return result
        }
        guard let first = sensors.first else {
          self.emit("readTemperature: Sensors array empty for device \(deviceId)")
          return result
        }
        let reading = first.reading
        if let floatReading = reading as? Float, floatReading.isNaN {
          self.emit("readTemperature: Sensor reading is NaN for device \(deviceId)")
          return result
        }
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
      for device in deviceList {
        let state = (device as? NSObject)?.value(forKey: "connectionState") as? Int ?? -1
        self.emit("refreshDeviceList: Device \(device.deviceIdentifier ?? "unknown") state = \(state)")
      }
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
    sendEvent("onChange", ["value": msg])
  }

  private func initializeThermaLibIfNeeded() {
    if isInitialized { return }

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

    isInitialized = true
    emit("Init ThermaLib")
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
      let state = (device as? NSObject)?.value(forKey: "connectionState") as? Int ?? -1
      let identifier = device.deviceIdentifier ?? "unknown"
      let msg = "Device \(identifier) updated with state \(state)"
      emit(msg)
      if state == 2 { // Assuming 2 means connected
        emit("Device \(identifier) is ready")
      } else {
        emit("Device \(identifier) not ready, state: \(state)")
      }
    } else {
      emit("deviceUpdated: Notification object is not a TLDevice")
    }
  }
}
