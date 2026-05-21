package com.hiprotech.deliveryboy

import android.app.Application
import android.content.Intent
import android.content.res.Configuration
import android.util.Log
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.ReactHost
import com.facebook.react.common.ReleaseLevel
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint
import com.facebook.react.defaults.DefaultReactNativeHost

import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ReactNativeHostWrapper

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost = ReactNativeHostWrapper(
      this,
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override fun getBundleAssetName(): String {
          return "index.android.bundle"
        }

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
      }
  )

  override val reactHost: ReactHost
    get() = ReactNativeHostWrapper.createReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    DefaultNewArchitectureEntryPoint.releaseLevel = try {
      ReleaseLevel.valueOf(BuildConfig.REACT_NATIVE_RELEASE_LEVEL.uppercase())
    } catch (e: IllegalArgumentException) {
      ReleaseLevel.STABLE
    }
    // Install a default uncaught exception handler that writes a crash log and
    // opens a share chooser so you can send the crash report from the device
    // without adb or an emulator.
    val defaultHandler = Thread.getDefaultUncaughtExceptionHandler()
    Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
      try {
        val ts = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
        val dir = File(getExternalFilesDir("crash_logs"), "")
        dir.mkdirs()
        val file = File(dir, "crash_$ts.txt")
        val trace = Log.getStackTraceString(throwable)
        file.writeText(trace)

        // Start share intent so the user can email/send the crash log from the device
        val shareIntent = Intent(Intent.ACTION_SEND).apply {
          putExtra(Intent.EXTRA_SUBJECT, "Crash report: ${BuildConfig.APPLICATION_ID}")
          putExtra(Intent.EXTRA_TEXT, trace)
          type = "text/plain"
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        startActivity(Intent.createChooser(shareIntent, "Share crash log").apply { addFlags(Intent.FLAG_ACTIVITY_NEW_TASK) })
      } catch (e: Exception) {
        // ignore any failures while trying to report the crash
      }
      // delegate to the original handler (this will kill the process as usual)
      defaultHandler?.uncaughtException(thread, throwable)
    }
    loadReactNative(this)
    ApplicationLifecycleDispatcher.onApplicationCreate(this)
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
  }
}
