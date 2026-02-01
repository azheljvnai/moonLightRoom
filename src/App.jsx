import { useEffect, useRef, useState } from 'react'
import CameraPreview from './components/CameraPreview'
import PhotoCapture from './components/PhotoCapture'
import VideoRecorder from './components/VideoRecorder'
import ValentineOverlay from './components/ValentineOverlay'
import BackgroundAudio from './components/BackgroundAudio'

function App() {
  const videoRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [cameraLoading, setCameraLoading] = useState(true)
  const [showValentineOverlay, setShowValentineOverlay] = useState(false)

  useEffect(() => {
    let mediaStream = null

    async function startCamera() {
      try {
        setCameraError(null)
        setCameraLoading(true)
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        })
        setStream(mediaStream)
      } catch (err) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraError('Camera and microphone access was denied. Please allow access to use the preview.')
        } else if (err.name === 'NotFoundError') {
          setCameraError('No camera or microphone was found on this device.')
        } else if (err.name === 'NotReadableError') {
          setCameraError('Camera or microphone is in use by another app.')
        } else {
          setCameraError(err.message || 'Failed to access camera and microphone.')
        }
      } finally {
        setCameraLoading(false)
      }
    }

    startCamera()

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  return (
    <div className="app-bg min-h-screen text-white p-6 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center tracking-wide">Moon Light Room</h1>
      <p className="text-center text-white/60 mt-2 text-lg">ENHYPEN-inspired photo booth</p>
      <CameraPreview
        ref={videoRef}
        stream={stream}
        error={cameraError}
        loading={cameraLoading}
      />
      <PhotoCapture
        videoRef={videoRef}
        onPhotoCaptured={() => setShowValentineOverlay(true)}
        autoDownload
      />
      <VideoRecorder stream={stream} autoDownload />
      <ValentineOverlay
        visible={showValentineOverlay}
        onDismiss={() => setShowValentineOverlay(false)}
      />
      <BackgroundAudio />
    </div>
  )
}

export default App
