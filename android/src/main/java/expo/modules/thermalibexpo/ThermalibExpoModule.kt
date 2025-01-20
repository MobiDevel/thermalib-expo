package expo.modules.thermalibexpo

import android.content.Context
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.exception.UnexpectedException
import uk.co.etiltd.thermalib.Device
import uk.co.etiltd.thermalib.ThermaLib

/**
 * Interface for propagating log messages to the parent class
 */
interface ThermaLibLogListener {
    fun onLogMessage(message: String)
}

val TAG =  "ThermalibExpo"

lateinit var TL : ThermaLib

var currentDevice: Device? = null

// the ThermaLib devices the master list contains. Filled in by executing a ThermaLib scan for devices
var deviceList = arrayOf<Device>()

fun refreshDeviceList() {
  deviceList = TL.deviceList.toTypedArray()
}

class ThermalibExpoModule : Module(), ThermaLibLogListener {
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

  override fun onLogMessage(message: String) {
    // This method is triggered by ThermaLibCallbacks and logs the message
    sendMessage(message)
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
      return@Function devices()
    }
    
    OnCreate {        
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

      // Register ThermaLibCallbacks and pass `this` as the listener
      TL.registerCallbacks(ThermaLibCallbacks(this@ThermalibExpoModule), TAG)
    }

    OnDestroy{
      TL.deregisterCallbacks(context)
      val dev = currentDevice
      if(dev !== null){
          dev.requestDisconnection()
      }
    }

    Function("readTemperature") { deviceId: String? ->
      if(deviceId == null){
          throw UnexpectedException("Specify device id")
      }

      return@Function readTemperature(deviceId)
    }

    Function("readDevice") { deviceId: String? ->
      return@Function readDevice(deviceId)
    }
  }

  private fun devices(): WritableArray? {
    refreshDeviceList()
    if(deviceList.isNotEmpty()){
        val result = Arguments.createArray()
        for(dev in deviceList){
            result.pushMap(convertDeviceToWritebleMap(dev))
        }
        return result
    }

    return null
  }

  private fun readTemperature(deviceId: String?): WritableMap {
      val result = Arguments.createMap();
      val device = connectToDevice(deviceId) ?: return result

      if(device.sensors.size == 0 ){
          sendMessage("Found no sensors on device $deviceId")
          return result
      }

      val sensor = device.sensors.first()
      val reading = sensor.reading
      sendMessage("Read device. Value: $reading")

      result.putDouble("reading", reading.toDouble())

      return result
  }

  private fun connectToDevice(deviceId: String?): Device? {
        if(deviceId == null){
            sendEvent("Specify device id")
            return null;
        }

        val foundDev:Device? = TL.getDeviceWithIdentifierAndTransport(deviceId, ThermaLib.Transport.BLUETOOTH_LE)
        if(foundDev == null){
            sendEvent("Found no match for $deviceId")
            return null;
        }

        currentDevice = foundDev;

        // Connect to the device
        if(!foundDev.isReady){
            foundDev.requestConnection(5)
        }

        return foundDev
    }

  private fun readDevice(deviceId: String?): WritableMap {
        val result = Arguments.createMap();
        if(deviceId == null){
            sendEvent("Specify device id")
            return result;
        }

        val foundDev:Device? = connectToDevice(deviceId)
        if(foundDev == null){
            sendEvent("Found no match for $deviceId")
            return result;
        }

        result.putMap("device", convertDeviceToWritebleMap(foundDev))

        return result
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
}

/**
 * Illustrates: Handling of scan-time ThermaLib callbacks with parent class logging
 */
class ThermaLibCallbacks(private val logListener: ThermaLibLogListener?) : ThermaLib.ClientCallbacksBase() {
  private fun log(message: String) {
      // Log to Logcat
      Log.d(TAG, message)

      // Forward the log message to the listener if provided
      logListener?.onLogMessage(message)
  }

  override fun onScanComplete(
      transport: Int, scanResult: ThermaLib.ScanResult, numDevices: Int, errorMsg: String?
  ) {
      if (errorMsg !== null) {
        log(errorMsg)
      }

      if (scanResult == ThermaLib.ScanResult.SUCCESS) {
        log(
              "$numDevices found in scan"
          )

          refreshDeviceList()
      } else {
        log(
              "Scan failed: ${scanResult.desc}"
          )
      }
  }

  override fun onNewDevice(device: Device, timestamp: Long) {
    log(
          "New device found: ${device.deviceName}"
      )
      refreshDeviceList()
  }

  override fun onDeviceConnectionStateChanged(
      device: Device, newState: Device.ConnectionState?, timestamp: Long
  ) {
    log(
          "Device ${device.identifier} changed state -> ${device.connectionState}"
      )
  }

  override fun onDeviceUpdated(device: Device, timestamp: Long) {
    log(
          "Device ${device.identifier} updated"
      )
  }
}
