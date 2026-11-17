package com.lab3mobile.nfc

import android.app.Activity
import android.app.PendingIntent
import android.content.Intent
import android.nfc.NdefMessage
import android.nfc.NfcAdapter
import android.nfc.Tag
import android.os.Build
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.lab3mobile.codegen.NativeNfcModuleSpec

@ReactModule(name = NfcModule.NAME)
class NfcModule(reactContext: ReactApplicationContext) :
    NativeNfcModuleSpec(reactContext),
    ActivityEventListener {

    companion object {
        const val NAME = "NfcModule"
    }

    private var nfcAdapter: NfcAdapter? = null
    private var isScanning = false

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = NAME

    @ReactMethod
    override fun isSupported(promise: Promise) {
        val activity = reactApplicationContext.currentActivity
        if (activity == null) {
            promise.resolve(false)
            return
        }
        val adapter = NfcAdapter.getDefaultAdapter(activity)
        promise.resolve(adapter != null)
    }

    @ReactMethod
    override fun startScan() {
        val activity = reactApplicationContext.currentActivity ?: run {
            sendEvent("onNfcError", Arguments.createMap().apply {
                putString("error", "Activity not available")
            })
            return
        }

        nfcAdapter = NfcAdapter.getDefaultAdapter(activity)

        if (nfcAdapter == null) {
            sendEvent("onNfcError", Arguments.createMap().apply {
                putString("error", "NFC is not supported on this device")
            })
            return
        }

        if (!nfcAdapter!!.isEnabled) {
            sendEvent("onNfcError", Arguments.createMap().apply {
                putString("error", "NFC is disabled. Please enable it in Settings.")
            })
            return
        }

        val intent = Intent(activity, activity.javaClass).apply {
            addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
        }
        val pendingIntent = PendingIntent.getActivity(
            activity, 0, intent,
            PendingIntent.FLAG_MUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        activity.runOnUiThread {
            try {
                nfcAdapter?.enableForegroundDispatch(activity, pendingIntent, null, null)
                isScanning = true
                sendEvent("onNfcStatus", Arguments.createMap().apply {
                    putString("status", "scanning")
                    putString("message", "Ready to scan. Hold an NFC tag near the device.")
                })
            } catch (e: Exception) {
                sendEvent("onNfcError", Arguments.createMap().apply {
                    putString("error", "Failed to start NFC scan: ${e.message}")
                })
            }
        }
    }

    @ReactMethod
    override fun stopScan() {
        val activity = reactApplicationContext.currentActivity ?: return
        activity.runOnUiThread {
            try {
                nfcAdapter?.disableForegroundDispatch(activity)
                isScanning = false
                sendEvent("onNfcStatus", Arguments.createMap().apply {
                    putString("status", "stopped")
                    putString("message", "NFC scan stopped.")
                })
            } catch (e: Exception) {
                // Activity might not be in resumed state
            }
        }
    }

    @ReactMethod
    override fun addListener(eventName: String?) {
        // Required for RN NativeEventEmitter
    }

    @ReactMethod
    override fun removeListeners(count: Double) {
        // Required for RN NativeEventEmitter
    }

    override fun onNewIntent(intent: Intent) {
        if (NfcAdapter.ACTION_NDEF_DISCOVERED == intent.action ||
            NfcAdapter.ACTION_TECH_DISCOVERED == intent.action ||
            NfcAdapter.ACTION_TAG_DISCOVERED == intent.action
        ) {
            handleNfcTag(intent)
        }
    }

    override fun onActivityResult(
        activity: Activity,
        requestCode: Int,
        resultCode: Int,
        data: Intent?
    ) {
        // Not used for NFC
    }

    private fun handleNfcTag(intent: Intent) {
        val tagData = Arguments.createMap()

        // Get Tag object
        val tag: Tag? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            intent.getParcelableExtra(NfcAdapter.EXTRA_TAG, Tag::class.java)
        } else {
            @Suppress("DEPRECATION")
            intent.getParcelableExtra(NfcAdapter.EXTRA_TAG)
        }

        // Tag ID (hex format)
        tag?.id?.let { id ->
            tagData.putString("id", id.joinToString(":") { String.format("%02X", it) })
        }

        // Tech list
        tag?.techList?.let { techList ->
            val techArray = Arguments.createArray()
            techList.forEach { tech ->
                techArray.pushString(tech.substringAfterLast("."))
            }
            tagData.putArray("techList", techArray)
        }

        // NDEF Messages
        val rawMessages = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            intent.getParcelableArrayExtra(NfcAdapter.EXTRA_NDEF_MESSAGES, NdefMessage::class.java)
        } else {
            @Suppress("DEPRECATION")
            intent.getParcelableArrayExtra(NfcAdapter.EXTRA_NDEF_MESSAGES)
        }

        if (rawMessages != null && rawMessages.isNotEmpty()) {
            val records = Arguments.createArray()
            rawMessages.forEach { raw ->
                val ndefMessage = raw as NdefMessage
                ndefMessage.records.forEach { record ->
                    val recordMap = Arguments.createMap()

                    // TNF (Type Name Format)
                    val tnfName = when (record.tnf.toInt()) {
                        0 -> "EMPTY"
                        1 -> "WELL_KNOWN"
                        2 -> "MIME_MEDIA"
                        3 -> "ABSOLUTE_URI"
                        4 -> "EXTERNAL_TYPE"
                        5 -> "UNKNOWN"
                        else -> "UNCHANGED"
                    }
                    recordMap.putString("tnf", tnfName)

                    // Type
                    recordMap.putString("type", String(record.type, Charsets.UTF_8))

                    // Payload - try to decode as text
                    val payload = record.payload
                    if (payload.isNotEmpty()) {
                        try {
                            if (record.tnf.toInt() == 1 && String(record.type) == "T") {
                                val languageCodeLength = payload[0].toInt() and 0x3F
                                val text = String(
                                    payload,
                                    languageCodeLength + 1,
                                    payload.size - languageCodeLength - 1,
                                    Charsets.UTF_8
                                )
                                recordMap.putString("payload", text)
                            } else if (record.tnf.toInt() == 1 && String(record.type) == "U") {
                                val uriPrefix = getUriPrefix(payload[0].toInt())
                                val uriBody = String(payload, 1, payload.size - 1, Charsets.UTF_8)
                                recordMap.putString("payload", uriPrefix + uriBody)
                            } else {
                                recordMap.putString("payload", String(payload, Charsets.UTF_8))
                            }
                        } catch (e: Exception) {
                            recordMap.putString("payload", payload.joinToString("") {
                                String.format("%02X", it)
                            })
                        }
                    } else {
                        recordMap.putString("payload", "")
                    }

                    records.pushMap(recordMap)
                }
            }
            tagData.putArray("ndefRecords", records)
        } else {
            tagData.putArray("ndefRecords", Arguments.createArray())
        }

        sendEvent("onNfcTagDiscovered", tagData)
    }

    private fun getUriPrefix(code: Int): String {
        return when (code) {
            0x00 -> ""
            0x01 -> "http://www."
            0x02 -> "https://www."
            0x03 -> "http://"
            0x04 -> "https://"
            0x05 -> "tel:"
            0x06 -> "mailto:"
            else -> ""
        }
    }

    private fun sendEvent(eventName: String, params: WritableMap) {
        try {
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        } catch (e: Exception) {
            // Context might not be initialized yet
        }
    }
}
