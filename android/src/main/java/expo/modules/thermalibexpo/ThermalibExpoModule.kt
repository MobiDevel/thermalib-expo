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

lateinit var TL : ThermaLib

class ThermalibExpoModule : Module() {    
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


    Function("getDevices") {
      refreshDeviceList()
      return@Function devices;
    }
    
    OnCreate {     
      appContext.reactContext?.let {
        TL = ThermaLib.instance(it)
        context = it
      }
      bluetooth()
      refreshDeviceList()
    }
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
}