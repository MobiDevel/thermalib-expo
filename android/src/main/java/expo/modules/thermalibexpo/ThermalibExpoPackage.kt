package expo.modules.thermalibexpo

import android.content.Context
import expo.modules.core.interfaces.Package
import expo.modules.core.interfaces.ApplicationLifecycleListener
import android.util.Log

class ThermalibPackage : Package {
  override fun createApplicationLifecycleListeners(context: Context): List<ApplicationLifecycleListener> {
    return listOf(ThermalibAppLifecycleListener())
  }
}