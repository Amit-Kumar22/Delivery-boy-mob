package com.hiprotech.deliveryboy

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import java.io.File

class ErrorActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    val root = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      val padding = (12 * resources.displayMetrics.density).toInt()
      setPadding(padding, padding, padding, padding)
    }

    val header = TextView(this).apply {
      text = "Startup failed — crash logs"
      textSize = 18f
    }
    root.addView(header)

    val info = TextView(this).apply {
      text = "A crash log was saved. Use the buttons below to view or share the latest log."
      textSize = 14f
    }
    root.addView(info)

    val scroll = ScrollView(this)
    val listLayout = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
    scroll.addView(listLayout)
    root.addView(scroll, LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f))

    val shareBtn = Button(this).apply { text = "Share latest log" }
    val viewBtn = Button(this).apply { text = "View latest log" }
    val clearBtn = Button(this).apply { text = "Clear logs" }

    root.addView(shareBtn)
    root.addView(viewBtn)
    root.addView(clearBtn)

    setContentView(root)

    val dir = File(getExternalFilesDir("crash_logs"), "")
    val files = dir.listFiles()?.sortedByDescending { it.lastModified() } ?: emptyList()

    if (files.isEmpty()) {
      val none = TextView(this).apply { text = "No crash logs found." }
      listLayout.addView(none)
      shareBtn.isEnabled = false
      viewBtn.isEnabled = false
      clearBtn.isEnabled = false
    } else {
      for (f in files) {
        val tv = TextView(this).apply {
          text = "${f.name} — ${java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(java.util.Date(f.lastModified()))}"
          textSize = 13f
          setPadding(0, (8 * resources.displayMetrics.density).toInt(), 0, (8 * resources.displayMetrics.density).toInt())
        }
        listLayout.addView(tv)
      }

      val latest = files.first()

      viewBtn.setOnClickListener {
        try {
          val content = latest.readText()
          val tv = TextView(this).apply {
            text = content
            textSize = 12f
          }
          val dialogLayout = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(20,20,20,20) }
          dialogLayout.addView(tv)
          val dlg = android.app.AlertDialog.Builder(this).setView(dialogLayout).setPositiveButton("OK", null).create()
          dlg.show()
        } catch (e: Exception) {
          android.widget.Toast.makeText(this, "Unable to read log: ${e.message}", android.widget.Toast.LENGTH_LONG).show()
        }
      }

      shareBtn.setOnClickListener {
        try {
          val uri = Uri.fromFile(latest)
          val shareIntent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_SUBJECT, "Crash log: ${latest.name}")
            putExtra(Intent.EXTRA_STREAM, uri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
          }
          startActivity(Intent.createChooser(shareIntent, "Share crash log"))
        } catch (e: Exception) {
          android.widget.Toast.makeText(this, "Unable to share: ${e.message}", android.widget.Toast.LENGTH_LONG).show()
        }
      }

      clearBtn.setOnClickListener {
        for (f in files) try { f.delete() } catch (_: Exception) {}
        android.widget.Toast.makeText(this, "Logs cleared", android.widget.Toast.LENGTH_SHORT).show()
        finish()
      }
    }
  }
}
