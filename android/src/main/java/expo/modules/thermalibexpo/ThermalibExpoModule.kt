package expo.modules.thermalibexpo

import android.content.Context
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.exception.UnexpectedException
import uk.co.etiltd.thermalib.Device
import uk.co.etiltd.thermalib.ThermaLib

val TAG =  "ThermalibExpo"

lateinit var TL : ThermaLib

// the ThermaLib devices the master list contains. Filled in by executing a ThermaLib scan for devices
var deviceList = arrayOf<Device>()

fun refreshDeviceList() {
  deviceList = TL.deviceList.toTypedArray()
}

class ThermalibExpoModule : Module() {
  private val context: Context
  get() = requireNotNull(appContext.reactContext)

  
  fun sendMessage(msg: String) {
      Log.d(TAG, msg)
      try {
          sendEvent("onChange",
              mapOf(
                  "value" to msg
              ))
  
      } catch (ex: Exception) {
          ex.message?.let { Log.d(TAG, it) }
      }
  }

  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('ThermalibExpo')` in JavaScript.
    Name(TAG)

    // Defines event names that the module can send to JavaScript.
    Events("onChange")

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("startScanning") {
      return@AsyncFunction startScanning()
    }

    Function("devices") {
      refreshDeviceList()
      if(deviceList.isNotEmpty()){
          val result = Arguments.createArray()
          for(dev in deviceList){
              result.pushMap(convertDeviceToWritebleMap(dev))
          }
          return@Function result
      }

      return@Function null
    }
    
    OnCreate {        
     initLib()
    }
  }

  private fun initLib() {
      sendMessage("Init ThermaLib")

      TL = ThermaLib.instance(context)
      // You can alter how ThermaLib responds to a call to a method that is not applicable to the Device/Sensor for which
      // it has been called. See the documentation for ThermaLib.UnsupportedCallHandling
      //
      TL.unsupportedCallHandling = ThermaLib.UnsupportedCallHandling.LOG
      sendMessage("Supported protocols: ${TL.supportedTransports}")
      sendMessage(
          "Register callbacks on ${TL}"
      )

      TL.registerCallbacks(thermaLibCallbacks, TAG)
  }

  private fun startScanning() {
    // ThermaLib: start scan for Bluetooth LE devices, with a 5-second timeout.
    // Completion will be dispatched via tlCallbacks
    val isConnected = TL.isServiceConnected(ThermaLib.Transport.BLUETOOTH_LE)
    if (isConnected == false) {
        sendMessage("No bluetooth!")
        return
    }

    sendMessage(
        "Starting to scan"
    )

    TL.stopScanForDevices()
    TL.startScanForDevices(ThermaLib.Transport.BLUETOOTH_LE, 20)
  }

  private fun convertDeviceToWritebleMap(dev: Device): WritableMap {
    val map = Arguments.createMap()
    map.putString("identifier", dev.identifier)
    map.putString("deviceName", dev.deviceName)
    map.putString("connectionState", dev.connectionState.toString())
    map.putString("modelNumber",dev.modelNumber)
    map.putString("manufacturerName",dev.manufacturerName)
    map.putInt("batteryLevel",dev.batteryLevel)
    map.putString("description", dev.description())
    map.putString("deviceType", dev.deviceType.toString())
    return map
  }
}

/**
* Illustrates: Handling of scan-time ThermaLib callbacks
*/
val thermaLibCallbacks = object : ThermaLib.ClientCallbacksBase() {
  override fun onScanComplete(
      transport: Int, scanResult: ThermaLib.ScanResult, numDevices: Int, errorMsg: String?
  ) {
      if (errorMsg !== null) {
        Log.d(TAG, errorMsg)
      }

      if (scanResult == ThermaLib.ScanResult.SUCCESS) {
        Log.d(TAG, 
              "$numDevices found in scan"
          )

          refreshDeviceList()
      } else {
        Log.d(TAG, 
              "Scan failed: ${scanResult.desc}"
          )
      }
  }

  override fun onNewDevice(device: Device, timestamp: Long) {
    Log.d(TAG, 
          "New device found: ${device.deviceName}"
      )
      refreshDeviceList()
  }

  override fun onDeviceConnectionStateChanged(
      device: Device, newState: Device.ConnectionState?, timestamp: Long
  ) {
    Log.d(TAG, 
          "Device ${device.identifier} changed state -> ${device.connectionState}"
      )
  }

  override fun onDeviceUpdated(device: Device, timestamp: Long) {
    Log.d(TAG, 
          "Device ${device.identifier} updated"
      )
  }
}
