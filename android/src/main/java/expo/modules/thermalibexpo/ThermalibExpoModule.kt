package expo.modules.thermalibexpo

import android.os.Build
import android.os.Bundle
import android.bluetooth.BluetoothManager
import android.content.Context
import android.util.Log
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.exception.UnexpectedException
import java.net.URL
import uk.co.etiltd.thermalib.Device
import uk.co.etiltd.thermalib.Sensor
import uk.co.etiltd.thermalib.ThermaLib

val TAG =  "ThermalibExpo"

class ThermalibExpoModule : Module() {
  lateinit var TL : ThermaLib

  // It's a Bluetooth app, so FINE_LOCATION permission is required. See permissions() below
  private val MY_PERMISSIONS_REQUEST_FINE_LOCATION = 1

  // the ThermaLib devices the master list contains. Filled in by executing a ThermaLib scan for devices
  var devices = arrayOf<Device>()

  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('ThermalibExpo')` in JavaScript.
    Name(TAG)

    // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
    Constants(
      "PI" to Math.PI
    )

    // Defines event names that the module can send to JavaScript.
    Events("onChange")

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { value: String ->
      // Send an event to JavaScript.
      sendEvent("onChange", mapOf(
        "value" to value
      ))
    }

    AsyncFunction("startScanning") {
      return@AsyncFunction startScanning()
    }

    AsyncFunction("getDevices") {
      refreshDeviceList()
      return@AsyncFunction devices;
    }
    
    OnCreate {        
      // Log.d(TAG, "Init ThermaLib");
      // TL = ThermaLib.instance(context);
      
      // sendEvent("onChange", mapOf(
      //   "value" to "Register callbacks"
      // ))

      // Log.d(TAG, "Register callbacks");
      // ThermaLib: Register callbacks. A more sophisticated implementation may register and deregister
      // callbacks dynamically, according to the activity state (started/stopped, paused/resumed..)
      // to avoid callbacks being invoked at inappropriate times. 
      // TL.registerCallbacks(thermaLibCallbacks, "ThermalibExpo");     
    }
  }

  private val context: Context
  get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private fun startScanning() {
    Log.d(TAG, "Init ThermaLib");
    TL = ThermaLib.instance(context);

    Log.d(TAG, "Register callbacks");
    sendEvent("onChange", mapOf(
      "value" to "Register callbacks"
    ))
    TL.registerCallbacks(thermaLibCallbacks, "ThermalibExpo"); 

    sendEvent("onChange", mapOf(
      "value" to "Starting to scan"
    ))

    Log.d(TAG, "Start scanning");

    // You can alter how ThermaLib responds to a call to a method that is not applicable to the Device/Sensor for which
    // it has been called. See the documentation for ThermaLib.UnsupportedCallHandling
    //
    TL.unsupportedCallHandling = ThermaLib.UnsupportedCallHandling.LOG

    // ThermaLib: start scan for Bluetooth LE devices, with a 5-second timeout.
    // Completion will be dispatched via tlCallbacks
    TL.stopScanForDevices();
    TL.startScanForDevices(ThermaLib.Transport.BLUETOOTH_LE, 15);
  }

  private fun refreshDeviceList() {
    // ThermaLib: illustrates the deviceList attribute
    devices = TL.deviceList.toTypedArray()
  }

  /**
   * Illustrates: Handling of scan-time ThermaLib callbacks
   */
  public val thermaLibCallbacks = object : ThermaLib.ClientCallbacksBase() {
    override fun onScanComplete(
            transport: Int,
            scanResult: ThermaLib.ScanResult,
            numDevices: Int,
            errorMsg: String?
    ) {
        if (scanResult == ThermaLib.ScanResult.SUCCESS) {
            sendEvent("onChange", mapOf(
              "value" to "${numDevices} found in scan"
            ))

            Log.d(TAG, "${numDevices} found in scan")
            refreshDeviceList()
        } else {
          sendEvent("onChange", 
          mapOf(
          "value" to "Scan failed: ${scanResult.desc}"
          ))

            Log.e(TAG, "Scan failed: ${scanResult.desc}", 
            IllegalStateException("Scan requested when already scanning"))
        }
    }

    override fun onNewDevice(device: Device, timestamp: Long) {
        Log.d(TAG, "New device found: ${device.deviceName}");
        sendEvent("onChange", mapOf(
          "value" to "New device found: ${device.deviceName}"
        ))
        refreshDeviceList()
    }

    override fun onDeviceConnectionStateChanged(device: Device, newState: Device.ConnectionState?, timestamp: Long) {
        Log.d(TAG, "Device ${device.identifier} changed state -> ${device.connectionState.toString()}")
        sendEvent("onChange", mapOf(
          "value" to "Device ${device.identifier} changed state -> ${device.connectionState.toString()}"
        ))
        // instrument_list.adapter?.notifyDataSetChanged()
    }

    override fun onDeviceUpdated(device: Device, timestamp: Long) {
        // instrument_list.adapter?.notifyDataSetChanged()
    }
  }
}
