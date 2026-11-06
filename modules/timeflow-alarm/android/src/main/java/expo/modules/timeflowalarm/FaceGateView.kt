package expo.modules.timeflowalarm

import android.Manifest
import android.content.pm.PackageManager
import android.os.Handler
import android.os.Looper
import android.util.Size
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.face.FaceDetection
import com.google.mlkit.vision.face.FaceDetectorOptions
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean

class FaceGateView(context: android.content.Context, appContext: AppContext) : ExpoView(context, appContext) {
  override val shouldUseAndroidLayout: Boolean = true

  val onFace by EventDispatcher()

  private val preview = PreviewView(context).apply {
    layoutParams = FrameLayout.LayoutParams(
      ViewGroup.LayoutParams.MATCH_PARENT,
      ViewGroup.LayoutParams.MATCH_PARENT,
    )
    scaleType = PreviewView.ScaleType.FILL_CENTER
    scaleX = -1f
    implementationMode = PreviewView.ImplementationMode.COMPATIBLE
  }
  private val mainHandler = Handler(Looper.getMainLooper())
  private var analysisExecutor = Executors.newSingleThreadExecutor()
  private val busy = AtomicBoolean(false)
  private val detector = FaceDetection.getClient(
    FaceDetectorOptions.Builder()
      .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_FAST)
      .setLandmarkMode(FaceDetectorOptions.LANDMARK_MODE_NONE)
      .setClassificationMode(FaceDetectorOptions.CLASSIFICATION_MODE_ALL)
      .setMinFaceSize(0.15f)
      .build(),
  )
  private var provider: ProcessCameraProvider? = null
  private var running = false
  private var lastEmit = 0L

  init {
    addView(preview)
  }

  fun setRunning(next: Boolean) {
    running = next
    if (next) {
      start()
    } else {
      stopCamera()
    }
  }

  override fun onDetachedFromWindow() {
    running = false
    stopCamera()
    super.onDetachedFromWindow()
  }

  private fun start() {
    if (!running) {
      return
    }
    if (ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
      return
    }
    if (analysisExecutor.isShutdown) {
      analysisExecutor = Executors.newSingleThreadExecutor()
    }
    val owner = appContext.currentActivity as? LifecycleOwner ?: return
    val future = ProcessCameraProvider.getInstance(context)
    future.addListener({
      if (!running) {
        return@addListener
      }
      val cameraProvider = future.get()
      provider = cameraProvider
      val previewUse = Preview.Builder().build().also { it.surfaceProvider = preview.surfaceProvider }
      val analysis = ImageAnalysis.Builder()
        .setTargetResolution(Size(640, 480))
        .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
        .build()
      analysis.setAnalyzer(analysisExecutor, ::analyze)
      try {
        cameraProvider.unbindAll()
        cameraProvider.bindToLifecycle(owner, CameraSelector.DEFAULT_FRONT_CAMERA, previewUse, analysis)
      } catch (_: Exception) {
        cameraProvider.unbindAll()
      }
    }, ContextCompat.getMainExecutor(context))
  }

  private fun stopCamera() {
    provider?.unbindAll()
  }

  private fun analyze(image: ImageProxy) {
    val media = image.image
    if (media == null || !busy.compareAndSet(false, true)) {
      image.close()
      return
    }
    val brightness = brightness(image)
    val rotation = image.imageInfo.rotationDegrees
    val uprightWidth = if (rotation == 90 || rotation == 270) image.height else image.width
    val uprightHeight = if (rotation == 90 || rotation == 270) image.width else image.height
    val input = try {
      InputImage.fromMediaImage(media, rotation)
    } catch (_: Exception) {
      busy.set(false)
      image.close()
      return
    }
    detector.process(input)
      .addOnSuccessListener { faces ->
        emit(faces.size, faces.maxByOrNull { it.boundingBox.width() * it.boundingBox.height() }, brightness, uprightWidth, uprightHeight)
      }
      .addOnFailureListener {
        emit(0, null, brightness, uprightWidth, uprightHeight)
      }
      .addOnCompleteListener {
        busy.set(false)
        image.close()
      }
  }

  private fun emit(
    count: Int,
    face: com.google.mlkit.vision.face.Face?,
    brightness: Double,
    width: Int,
    height: Int,
  ) {
    val now = System.currentTimeMillis()
    if (now - lastEmit < 80) {
      return
    }
    lastEmit = now
    val safeWidth = width.coerceAtLeast(1).toDouble()
    val safeHeight = height.coerceAtLeast(1).toDouble()
    val box = face?.boundingBox
    val payload = mapOf(
      "faces" to count,
      "yaw" to (face?.headEulerAngleY?.toDouble() ?: 0.0),
      "roll" to (face?.headEulerAngleZ?.toDouble() ?: 0.0),
      "brightness" to brightness,
      "centerX" to if (box == null) 0.0 else box.exactCenterX().toDouble() / safeWidth,
      "centerY" to if (box == null) 0.0 else box.exactCenterY().toDouble() / safeHeight,
      "faceRatio" to if (box == null) 0.0 else box.width().toDouble() / safeWidth,
      "leftEye" to probability(face?.leftEyeOpenProbability),
      "rightEye" to probability(face?.rightEyeOpenProbability),
      "smile" to probability(face?.smilingProbability),
    )
    mainHandler.post {
      if (isAttachedToWindow) {
        onFace(payload)
      }
    }
  }

  private fun probability(value: Float?): Double {
    if (value == null || value < 0f) {
      return -1.0
    }
    return value.toDouble()
  }

  private fun brightness(image: ImageProxy): Double {
    val buffer = image.planes.firstOrNull()?.buffer?.duplicate() ?: return 0.0
    val size = buffer.remaining()
    if (size <= 0) {
      return 0.0
    }
    buffer.rewind()
    var sum = 0.0
    var count = 0
    var index = 0
    while (index < size) {
      sum += buffer.get(index).toInt() and 0xFF
      count += 1
      index += 32
    }
    return if (count == 0) 0.0 else sum / count
  }
}
