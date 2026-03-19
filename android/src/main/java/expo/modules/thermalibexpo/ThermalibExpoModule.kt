package expo.modules.thermalibexpo

import android.content.Context
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import expo.modules.kotlin.exception.UnexpectedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import uk.co.etiltd.thermalib.Device
import uk.co.etiltd.thermalib.ThermaLib

/**
 * Interface for propagating native SDK events to the module.
 */
interface ThermaLibEventListener {
    fun onLogMessage(message: String)
    fun onButtonPressed(device: Device, timestamp: Long)
}

val TAG =  "ThermalibExpo"
private const val CHANGE_EVENT_NAME = "onChange"
private const val BUTTON_PRESS_EVENT_NAME = "onButtonPress"

lateinit var TL : ThermaLib

var currentDevice: Device? = null

// the ThermaLib devices the master list contains. Filled in by executing a ThermaLib scan for devices
var deviceList = arrayOf<Device>()

fun refreshDeviceList() {
  deviceList = TL.deviceList.toTypedArray()
}

class ThermalibExpoModule : Module(), ThermaLibEventListener {
  private val context: Context
  get() = requireNotNull(appContext.reactContext)

  private fun sendEventSafely(eventName: String, payload: Map<String, Any?>) {
    try {
      sendEvent(eventName, payload)
    } catch (ex: Exception) {
      ex.message?.let { Log.d(TAG, it) }
    }
  }

  fun sendMessage(msg: String) {
    Log.d(TAG, msg)
    sendEventSafely(
      CHANGE_EVENT_NAME,
      mapOf(
        "value" to msg
      )
    )
  }

  override fun onLogMessage(message: String) {
    // This method is triggered by ThermaLibCallbacks and logs the message
    sendMessage(message)
  }

  override fun onButtonPressed(device: Device, timestamp: Long) {
    val identifier = device.identifier
    sendMessage("Button pressed on device $identifier")
    sendEventSafely(
      BUTTON_PRESS_EVENT_NAME,
      mapOf(
        "identifier" to identifier,
        "deviceName" to device.deviceName,
        "timestamp" to timestamp.toDouble()
      )
    )
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
    Events(CHANGE_EVENT_NAME, BUTTON_PRESS_EVENT_NAME)

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("startScanning") {
      return@AsyncFunction startScanning()
    }

    Function("initThermaLib") {
      initializeThermaLibIfNeeded()
    }

    Function("devices") {
      return@Function devices()
    }
    
    OnCreate {
      initializeThermaLibIfNeeded()
    }

    OnDestroy{
      if (!::TL.isInitialized) {
        return@OnDestroy
      }
      TL.deregisterCallbacks(context)
      val dev = currentDevice
      if(dev !== null){
          dev.requestDisconnection()
      }
    }

    AsyncFunction("readTemperature") { deviceId: String? ->
      if(deviceId == null){
          throw UnexpectedException("Specify device id")
      }

      return@AsyncFunction readTemperature(deviceId)
    }

    AsyncFunction("connectDevice") { deviceId: String? ->
      if(deviceId == null){
        throw UnexpectedException("Specify device id")
      }

      connectToDevice(deviceId)
      return@AsyncFunction
    }

    Function("readDevice") { deviceId: String? ->
      return@Function readDevice(deviceId)
    }
  }

  private fun devices(): WritableArray? {
    initializeThermaLibIfNeeded()
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
      initializeThermaLibIfNeeded()
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
        initializeThermaLibIfNeeded()
        if(deviceId == null){
            sendMessage("Specify device id")
            return null;
        }

        val foundDev:Device? = TL.getDeviceWithIdentifierAndTransport(deviceId, ThermaLib.Transport.BLUETOOTH_LE)
        if(foundDev == null){
            sendMessage("Found no match for $deviceId")
            return null;
        }

        currentDevice = foundDev;

        // Connect to the device
        if(!foundDev.isReady){
            foundDev.requestConnection(5)
        }

        return foundDev
    }

  private fun readDevice(deviceId: String?): WritableMap? {
        initializeThermaLibIfNeeded()
        if(deviceId == null){
            sendMessage("Specify device id")
            return null
        }

        val foundDev:Device? = connectToDevice(deviceId)
        if(foundDev == null){
            sendMessage("Found no match for $deviceId")
            return null
        }

        return convertDeviceToWritebleMap(foundDev)
  }

  private fun convertDeviceToWritebleMap(dev: Device): WritableMap {
      val map = Arguments.createMap()
      map.putString("identifier", dev.identifier)
      map.putString("deviceName", dev.deviceName)
      map.putString("connectionState", dev.connectionState.toString())
      map.putBoolean("isConnected", dev.isConnected)
      map.putBoolean("isReady", dev.isReady)
      map.putString("modelNumber",dev.modelNumber)
      map.putString("manufacturerName",dev.manufacturerName)
      map.putInt("batteryLevel",dev.batteryLevel)
      map.putString("description", dev.description())
      map.putString("deviceType", dev.deviceType.toString())
      return map
  }

  private fun startScanning() {
    initializeThermaLibIfNeeded()
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

  private fun initializeThermaLibIfNeeded() {
    if (::TL.isInitialized) {
      return
    }

    sendMessage("Init ThermaLib")

    TL = ThermaLib.instance(context)
    TL.unsupportedCallHandling = ThermaLib.UnsupportedCallHandling.LOG
    sendMessage("Supported protocols: ${TL.supportedTransports}")
    sendMessage("Register callbacks on ${TL}")
    TL.registerCallbacks(ThermaLibCallbacks(this@ThermalibExpoModule), TAG)
  }
}

/**
 * Illustrates: Handling of scan-time ThermaLib callbacks with parent class logging
 */
class ThermaLibCallbacks(private val eventListener: ThermaLibEventListener?) : ThermaLib.ClientCallbacksBase() {
  private fun log(message: String) {
      // Log to Logcat
      Log.d(TAG, message)

      // Forward the log message to the listener if provided
      eventListener?.onLogMessage(message)
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

  override fun onDeviceNotificationReceived(
      device: Device,
      notificationType: Int,
      data: ByteArray?,
      timestamp: Long
  ) {
      val notificationName = Device.NotificationType.toString(notificationType)
      log("Device ${device.identifier} notification received: $notificationName")

      if (notificationType == Device.NotificationType.BUTTON_PRESSED) {
          eventListener?.onButtonPressed(device, timestamp)
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

  override fun onDeviceReady(device: Device, timestamp: Long) {
    log("Device ${device.identifier} is ready")
  }

  override fun onDeviceUpdated(device: Device, timestamp: Long) {
    log(
          "Device ${device.identifier} updated"
      )
  }
}
