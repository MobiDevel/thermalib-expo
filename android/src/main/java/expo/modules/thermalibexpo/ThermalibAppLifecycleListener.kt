package expo.modules.thermalibexpo

import android.app.Application
import expo.modules.core.interfaces.ApplicationLifecycleListener
import android.util.Log

import uk.co.etiltd.thermalib.ThermaLib

lateinit var TL : ThermaLib

class ThermalibAppLifecycleListener : ApplicationLifecycleListener {
  private val TAG = "ThermalibExpo";
  
  override fun onCreate(application: Application) {
    Log.d(TAG, "Init ThermaLib");
    TL = ThermaLib.instance(application.applicationContext)
  }
}