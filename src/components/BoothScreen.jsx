import { useState, useRef, useEffect } from 'react'
import { Camera, ChevronRight, Timer, RotateCcw } from 'lucide-react'

const PHOTO_COUNT = 4
const TIMER_INTERVAL_SEC = 10

export default function BoothScreen({
  videoRef,
  videoReady,
  stream,
  overlayImage,
  onNext,
}) {
  const [photos, setPhotos] = useState([])
  const [capturing, setCapturing] = useState(false)
  const [captureMode, setCaptureMode] = useState('manual')
  const [timerStarted, setTimerStarted] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [selectedForRetake, setSelectedForRetake] = useState(null) // which slot (0–3) to retake when full
  const timerIntervalRef = useRef(null)
  const timerPhotosAddedRef = useRef(0)
  const pendingTimerUrlRef = useRef(null)

  function doCapture() {
    const video = videoRef?.current
    if (!video || video.readyState < 2) return null
    const w = video.videoWidth
    const h = video.videoHeight
    if (w === 0 || h === 0) return null
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.save()
    ctx.scale(-1, 1)
    ctx.drawImage(video, -w, 0, w, h)
    ctx.restore()
    if (overlayImage?.complete && overlayImage.naturalWidth) {
      ctx.drawImage(overlayImage, 0, 0, w, h)
    }
    return canvas.toDataURL('image/png')
  }

  function addPhoto(dataUrl) {
    setPhotos((prev) => {
      if (prev.length >= PHOTO_COUNT) return prev
      return [...prev, dataUrl]
    })
  }

  function replacePhoto(index, dataUrl) {
    setPhotos((prev) => prev.map((p, i) => (i === index ? dataUrl : p)))
    setSelectedForRetake(null)
  }

  // Manual: one click = one photo (guard against double-fire)
  const manualCapturingRef = useRef(false)
  function takePhotoManual() {
    if (!videoReady || photos.length >= PHOTO_COUNT || manualCapturingRef.current) return
    manualCapturingRef.current = true
    setCapturing(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const url = doCapture()
        if (url) addPhoto(url)
        setCapturing(false)
        manualCapturingRef.current = false
      })
    })
  }

  function startTimerCapture() {
    if (!videoReady || photos.length >= PHOTO_COUNT) return
    timerPhotosAddedRef.current = 0
    setTimerStarted(true)
    setCountdown(TIMER_INTERVAL_SEC)
  }

  useEffect(() => {
    if (photos.length >= PHOTO_COUNT && timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
      setTimerStarted(false)
      setCountdown(null)
    }
  }, [photos.length])

  useEffect(() => {
    if (captureMode !== 'timed' || !timerStarted || photos.length >= PHOTO_COUNT) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
      return
    }
    timerIntervalRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 0) {
          if (timerPhotosAddedRef.current >= PHOTO_COUNT) return TIMER_INTERVAL_SEC
          const url = doCapture()
          if (url) {
            timerPhotosAddedRef.current += 1
            pendingTimerUrlRef.current = url
            setTimeout(() => {
              if (pendingTimerUrlRef.current) {
                setPhotos((prev) => (prev.length >= PHOTO_COUNT ? prev : [...prev, pendingTimerUrlRef.current]))
                pendingTimerUrlRef.current = null
              }
            }, 0)
          }
          return TIMER_INTERVAL_SEC
        }
        return c - 1
      })
    }, 1000)
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
  }, [captureMode, timerStarted, photos.length])

  const retakeCapturingRef = useRef(false)
  function handleRetakeCapture() {
    if (selectedForRetake === null || retakeCapturingRef.current) return
    retakeCapturingRef.current = true
    setCapturing(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const url = doCapture()
        if (url) replacePhoto(selectedForRetake, url)
        setCapturing(false)
        retakeCapturingRef.current = false
      })
    })
  }

  const full = photos.length >= PHOTO_COUNT

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <p className="text-center text-white/70 text-sm">
        Take {PHOTO_COUNT} photos ({photos.length}/{PHOTO_COUNT})
      </p>

      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={() => {
            setCaptureMode('manual')
            setTimerStarted(false)
            setCountdown(null)
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current)
              timerIntervalRef.current = null
            }
          }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            captureMode === 'manual'
              ? 'bg-rose-600 text-white'
              : 'bg-white/10 text-white/80 hover:bg-white/20'
          }`}
        >
          <Camera className="w-4 h-4" />
          Manual
        </button>
        <button
          type="button"
          onClick={() => setCaptureMode('timed')}
          disabled={full || timerStarted}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            captureMode === 'timed'
              ? 'bg-rose-600 text-white'
              : 'bg-white/10 text-white/80 hover:bg-white/20'
          } disabled:opacity-50 disabled:pointer-events-none`}
        >
          <Timer className="w-4 h-4" />
          {TIMER_INTERVAL_SEC}s auto
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4">
        {Array.from({ length: PHOTO_COUNT }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => full && setSelectedForRetake(i)}
            disabled={!full}
            className={`aspect-square rounded-xl overflow-hidden flex items-center justify-center transition-all ${
              full
                ? selectedForRetake === i
                  ? 'ring-2 ring-rose-500 ring-offset-2 ring-offset-[#0a0508]'
                  : 'ring-2 ring-white/20 hover:ring-white/40'
                : 'ring-1 ring-white/10 bg-black/50'
            } disabled:pointer-events-none`}
          >
            {photos[i] ? (
              <img
                src={photos[i]}
                alt={`Photo ${i + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white/30 text-xs">{i + 1}</span>
            )}
          </button>
        ))}
      </div>

      {captureMode === 'timed' && timerStarted && countdown !== null && photos.length < PHOTO_COUNT && (
        <div className="text-center">
          <p className="text-white/60 text-sm mb-1">Next photo in</p>
          <p className="text-4xl font-bold text-white/90 tabular-nums">{countdown}s</p>
        </div>
      )}

      {captureMode === 'timed' && !timerStarted && !full && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={startTimerCapture}
            disabled={!videoReady}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 font-medium transition-colors"
          >
            <Timer className="w-5 h-5" />
            Start {TIMER_INTERVAL_SEC}s auto capture
          </button>
        </div>
      )}

      {captureMode === 'manual' && !full && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={takePhotoManual}
            disabled={!videoReady || capturing}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 font-medium transition-colors"
          >
            <Camera className="w-5 h-5" />
            {capturing ? 'Capturing…' : 'Take Photo'}
          </button>
        </div>
      )}

      {full && (
        <div className="flex flex-wrap gap-3 justify-center items-center">
          {selectedForRetake !== null && (
            <button
              type="button"
              onClick={handleRetakeCapture}
              disabled={!videoReady || capturing}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 font-medium transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              {capturing ? 'Capturing…' : `Retry photo ${selectedForRetake + 1}`}
            </button>
          )}
          <button
            type="button"
            onClick={() => onNext(photos)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/15 hover:bg-white/25 font-medium transition-colors"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {full && selectedForRetake === null && (
        <p className="text-center text-white/50 text-sm">
          Click a photo to select it, then Retry to retake that one.
        </p>
      )}
    </div>
  )
}
