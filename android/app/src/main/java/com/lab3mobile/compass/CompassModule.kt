package com.lab3mobile.compass

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.lab3mobile.codegen.NativeCompassModuleSpec

@ReactModule(name = CompassModule.NAME)
class CompassModule(reactContext: ReactApplicationContext) :
    NativeCompassModuleSpec(reactContext),
    SensorEventListener {

    companion object {
        const val NAME = "CompassModule"
        private const val ALPHA = 0.15f // Low-pass filter smoothing coefficient
    }

    private val sensorManager: SensorManager? =
        reactContext.getSystemService(Context.SENSOR_SERVICE) as? SensorManager

    private val accelerometer: Sensor? =
        sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
    private val magnetometer: Sensor? =
        sensorManager?.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)

    private val gravityValues = FloatArray(3)
    private val geomagneticValues = FloatArray(3)
    private var hasGravity = false
    private var hasGeomagnetic = false

    private val rotationMatrix = FloatArray(9)
    private val orientationAngles = FloatArray(3)
    private var isListening = false
    private var lastHeading = 0.0

    override fun getName(): String = NAME

    @ReactMethod
    override fun isSupported(promise: Promise) {
        val supported = accelerometer != null && magnetometer != null
        promise.resolve(supported)
    }

    @ReactMethod
    override fun startCompass() {
        if (isListening) return

        if (sensorManager == null || accelerometer == null || magnetometer == null) {
            val params = Arguments.createMap().apply {
                putString("error", "Accelerometer or Magnetometer sensor not available")
            }
            sendEvent("onCompassError", params)
            return
        }

        hasGravity = false
        hasGeomagnetic = false

        // Register with SENSOR_DELAY_GAME for smooth interactive compass needle updates
        sensorManager.registerListener(this, accelerometer, SensorManager.SENSOR_DELAY_GAME)
        sensorManager.registerListener(this, magnetometer, SensorManager.SENSOR_DELAY_GAME)
        isListening = true
    }

    @ReactMethod
    override fun stopCompass() {
        if (!isListening) return
        sensorManager?.unregisterListener(this)
        isListening = false
    }

    @ReactMethod
    override fun addListener(eventName: String?) {
        // Required for NativeEventEmitter
    }

    @ReactMethod
    override fun removeListeners(count: Double) {
        // Required for NativeEventEmitter
    }

    override fun onSensorChanged(event: SensorEvent?) {
        event ?: return

        when (event.sensor.type) {
            Sensor.TYPE_ACCELEROMETER -> {
                // Apply low-pass filter to smooth gravity vector
                gravityValues[0] = lowPass(event.values[0], gravityValues[0])
                gravityValues[1] = lowPass(event.values[1], gravityValues[1])
                gravityValues[2] = lowPass(event.values[2], gravityValues[2])
                hasGravity = true
            }
            Sensor.TYPE_MAGNETIC_FIELD -> {
                // Apply low-pass filter to smooth geomagnetic vector
                geomagneticValues[0] = lowPass(event.values[0], geomagneticValues[0])
                geomagneticValues[1] = lowPass(event.values[1], geomagneticValues[1])
                geomagneticValues[2] = lowPass(event.values[2], geomagneticValues[2])
                hasGeomagnetic = true
            }
        }

        if (hasGravity && hasGeomagnetic) {
            val success = SensorManager.getRotationMatrix(
                rotationMatrix,
                null,
                gravityValues,
                geomagneticValues
            )

            if (success) {
                // Get orientation angles (azimuth, pitch, roll) in radians
                SensorManager.getOrientation(rotationMatrix, orientationAngles)
                val azimuthInRadians = orientationAngles[0]

                // Convert to degrees in range [0, 360)
                var degrees = Math.toDegrees(azimuthInRadians.toDouble())
                if (degrees < 0) {
                    degrees += 360.0
                }

                // Only emit if change is meaningful to avoid flooding JS bridge
                if (Math.abs(degrees - lastHeading) >= 0.5 || Math.abs(degrees - lastHeading) >= 355.0) {
                    lastHeading = degrees
                    val params = Arguments.createMap().apply {
                        putDouble("heading", degrees)
                        putString("direction", getCardinalDirection(degrees))
                    }
                    sendEvent("onCompassUpdate", params)
                }
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        // No-op
    }

    private fun lowPass(current: Float, previous: Float): Float {
        return previous + ALPHA * (current - previous)
    }

    private fun getCardinalDirection(heading: Double): String {
        return when {
            heading >= 337.5 || heading < 22.5 -> "N"
            heading in 22.5..67.5 -> "NE"
            heading in 67.5..112.5 -> "E"
            heading in 112.5..157.5 -> "SE"
            heading in 157.5..202.5 -> "S"
            heading in 202.5..247.5 -> "SW"
            heading in 247.5..292.5 -> "W"
            heading in 292.5..337.5 -> "NW"
            else -> "N"
        }
    }

    private fun sendEvent(eventName: String, params: com.facebook.react.bridge.WritableMap) {
        try {
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        } catch (e: Exception) {
            // Context not active
        }
    }
}

