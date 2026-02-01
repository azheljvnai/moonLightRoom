import { useCallback, useEffect, useRef, useState } from 'react'
import CameraPreview from './components/CameraPreview'
import StartScreen from './components/StartScreen'
import BoothScreen from './components/BoothScreen'
import FrameSelectScreen from './components/FrameSelectScreen'
import EndScreen from './components/EndScreen'
import ValentineOverlay from './components/ValentineOverlay'
import BackgroundAudio from './components/BackgroundAudio'
import ErrorModal from './components/ErrorModal'
import { useRecording } from './hooks/useRecording'

const OVERLAY_SRC = '/frames/red-moon-frame.png'
const FLOW_START = 'start'
const FLOW_BOOTH = 'booth'
const FLOW_FRAME = 'frame'
const FLOW_VALENTINE = 'valentine'
const FLOW_END = 'end'

function App() {
  const videoRef = useRef(null)
  const [flow, setFlow] = useState(FLOW_START)
  const [stream, setStream] = useState(null)
  const [videoReady, setVideoReady] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [photos, setPhotos] = useState([])
  const [finalPhotoUrl, setFinalPhotoUrl] = useState(null)
  const [overlayImage, setOverlayImage] = useState(null)

  const {
    isRecording,
    recordedUrl,
    recordedFilename,
    startRecording,
    stopRecording,
  } = useRecording()

  useEffect(() => {
    const img = new Image()
    img.onload = () => setOverlayImage(img)
    img.onerror = () => {}
    img.src = OVERLAY_SRC
    return () => {
      img.src = ''
    }
  }, [])

  async function handleStart() {
    setCameraLoading(true)
    setCameraError(null)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      })
      setVideoReady(false)
      setStream(mediaStream)
      setFlow(FLOW_BOOTH)
      startRecording(mediaStream)
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera and microphone access was denied.')
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera or microphone was found.')
      } else if (err.name === 'NotReadableError') {
        setCameraError('Camera or microphone is in use by another app.')
      } else {
        setCameraError(err.message || 'Failed to access camera.')
      }
    } finally {
      setCameraLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  const onVideoReady = useCallback(() => setVideoReady(true), [])

  function handleBoothNext(photoList) {
    setPhotos(photoList)
    setFlow(FLOW_FRAME)
  }

  function handleFrameNext(url) {
    setFinalPhotoUrl(url)
    setFlow(FLOW_VALENTINE)
  }

  function handleValentineDismiss() {
    setFlow(FLOW_END)
    stopRecording()
  }

  const showHeader = flow !== FLOW_START

  return (
    <div className="app-bg min-h-screen text-white p-6 pb-24">
      {showHeader && (
        <header className="max-w-2xl mx-auto mb-6 text-center">
          <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-white/95">
            Moon Light Room
          </h1>
          <p className="text-white/50 text-sm mt-1">ENHYPEN-inspired photo booth</p>
        </header>
      )}

      {flow === FLOW_START && (
        <StartScreen onStart={handleStart} loading={cameraLoading} />
      )}

      {flow === FLOW_BOOTH && stream && (
        <>
          <div className="w-full max-w-2xl mx-auto mb-6">
            <CameraPreview
              ref={videoRef}
              stream={stream}
              error={cameraError}
              loading={false}
              onVideoReady={onVideoReady}
            />
          </div>
          <BoothScreen
            videoRef={videoRef}
            videoReady={videoReady}
            stream={stream}
            overlayImage={overlayImage}
            onNext={handleBoothNext}
          />
        </>
      )}

      {flow === FLOW_FRAME && photos.length > 0 && (
        <FrameSelectScreen
          photos={photos}
          overlayImage={overlayImage}
          onNext={handleFrameNext}
        />
      )}

      {flow === FLOW_VALENTINE && (
        <ValentineOverlay visible onDismiss={handleValentineDismiss} />
      )}

      {flow === FLOW_END && (
        <EndScreen
          finalPhotoUrl={finalPhotoUrl}
          recordedUrl={recordedUrl}
          recordedFilename={recordedFilename}
        />
      )}

      <BackgroundAudio />

      {cameraError && (
        <ErrorModal
          title="Camera access required"
          message={cameraError}
          onClose={() => setCameraError(null)}
        />
      )}
    </div>
  )
}

export default App
