package expo.modules.thermalibexpo

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.URL
import android.bluetooth.BluetoothManager
import uk.co.etiltd.thermalib.ThermaLib
import uk.co.etiltd.thermalib.Device
import uk.co.etiltd.thermalib.Sensor
import android.content.Context
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import android.util.Log

lateinit var TL : ThermaLib

class ThermalibExpoModule : Module() {   
  private val TAG = "ThermalibExpo";

  // It's a Bluetooth app, so FINE_LOCATION permission is required. See permissions() below
  private val MY_PERMISSIONS_REQUEST_FINE_LOCATION = 1

  lateinit var context: Context

  // the ThermaLib devices the master list contains. Filled in by executing a ThermaLib scan for devices
  var devices = arrayOf<Device>()


  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('ThermalibExpo')` in JavaScript.
    Name("ThermalibExpo")

    // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
    Constants(
      "PI" to Math.PI
    )

    // Defines event names that the module can send to JavaScript.
    Events("onChange")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      "Hello world! 👋"
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { value: String ->
      // Send an event to JavaScript.
      sendEvent("onChange", mapOf(
        "value" to value
      ))
    }

    Function("checkBluetooth") {
      return@Function bluetooth()
    }

    Function("startScanning") {
      return@Function startScanning()
    }

    Function("getDevices") {
      refreshDeviceList()
      return@Function devices;
    }
    
    OnCreate {     
      appContext.reactContext?.let {
        TL = ThermaLib.instance(it)
        context = it

        bluetooth()

        //
        // You can alter how ThermaLib responds to a call to a method that is not applicable to the Device/Sensor for which
        // it has been called. See the documentation for ThermaLib.UnsupportedCallHandling
        //
        TL.unsupportedCallHandling = ThermaLib.UnsupportedCallHandling.LOG
       
        //
        // ThermaLib: Register callbacks. A more sophisticated implementation may register and deregister
        // callbacks dynamically, according to the activity state (started/stopped, paused/resumed..)
        // to avoid callbacks being invoked at inappropriate times.
        //
        // TL.registerCallbacks(thermaLibCallbacks, "InstrumentList");  
      } 
    }
  }

  private fun startScanning() {
    // ThermaLib: start scan for Bluetooth LE devices, with a 5-second timeout.
    // Completion will be dispatched via tlCallbacks
    TL.startScanForDevices(ThermaLib.Transport.BLUETOOTH_LE, 5);
  }

  private fun refreshDeviceList() {
    // ThermaLib: illustrates the deviceList attribute
    devices = TL.deviceList.toTypedArray()
  }

  private fun bluetooth() {
    val bluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
    if( bluetoothManager.adapter == null ) {
        Toast.makeText(context, "No bluetooth adapter - sorry", Toast.LENGTH_LONG).show()
        // finish()
    }
    else if( !bluetoothManager.adapter.isEnabled ) {
        AlertDialog.Builder(context).apply {
            setMessage("This app uses Bluetooth. Turn on now?")
            setPositiveButton(android.R.string.yes) {_, _ ->
                bluetoothManager.adapter.enable()
            }
            setNegativeButton(android.R.string.no) {_, _ ->
                Toast.makeText(context, "Bye then..", Toast.LENGTH_LONG).show()
                // finish()
            }
            create().show()
        }
    }
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
            Log.d(TAG, "${numDevices} found in scan")
            refreshDeviceList()
        } else {
            Log.e(TAG, "Scan failed: ${scanResult.desc}", IllegalStateException("Scan requested when already scanning"))
        }
    }

    override fun onNewDevice(device: Device, timestamp: Long) {
        Log.d(TAG, "New device found: ${device.deviceName}");
        refreshDeviceList()
    }

    override fun onDeviceConnectionStateChanged(device: Device, newState: Device.ConnectionState?, timestamp: Long) {
        Log.d(TAG, "Device ${device.identifier} changed state -> ${device.connectionState.toString()}")
        // instrument_list.adapter?.notifyDataSetChanged()
    }

    override fun onDeviceUpdated(device: Device, timestamp: Long) {
        // instrument_list.adapter?.notifyDataSetChanged()
    }
  }
}
