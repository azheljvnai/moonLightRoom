import { useState, useRef, useEffect } from 'react'
import { Camera, ChevronLeft, ChevronRight, Timer, RotateCcw } from 'lucide-react'

const PHOTO_COUNT = 4
const TIMER_INTERVAL_SEC = 10

export default function BoothScreen({
  videoRef,
  videoReady,
  stream,
  overlayImage,
  onNext,
  onBack,
}) {
  const [photos, setPhotos] = useState([])
  const [capturing, setCapturing] = useState(false)
  const [captureMode, setCaptureMode] = useState('manual')
  const [timerStarted, setTimerStarted] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [selectedForRetake, setSelectedForRetake] = useState(null) // which slot (0–3) to retake when full
  const timerIntervalRef = useRef(null)
  const timerPhotosAddedRef = useRef(0)
  const timerCountdownRef = useRef(TIMER_INTERVAL_SEC) // seconds left for current photo (single source of truth)

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
    timerCountdownRef.current = TIMER_INTERVAL_SEC
    setTimerStarted(true)
    setCountdown(TIMER_INTERVAL_SEC)
  }

  // Timer: 10s per photo, 1 by 1, total 4. Use ref for countdown so interval doesn't depend on state.
  useEffect(() => {
    if (captureMode !== 'timed' || !timerStarted) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
      return
    }
    timerIntervalRef.current = setInterval(() => {
      timerCountdownRef.current -= 1
      const secsLeft = timerCountdownRef.current
      setCountdown(secsLeft)

      if (secsLeft <= 0) {
        if (timerPhotosAddedRef.current >= PHOTO_COUNT) {
          return
        }
        const url = doCapture()
        if (url) {
          timerPhotosAddedRef.current += 1
          setPhotos((prev) => {
            if (prev.length >= PHOTO_COUNT) return prev
            return [...prev, url]
          })
        }
        if (timerPhotosAddedRef.current >= PHOTO_COUNT) {
          clearInterval(timerIntervalRef.current)
          timerIntervalRef.current = null
          setTimerStarted(false)
          setCountdown(null)
        } else {
          timerCountdownRef.current = TIMER_INTERVAL_SEC
          setCountdown(TIMER_INTERVAL_SEC)
        }
      }
    }, 1000)
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
  }, [captureMode, timerStarted])

  // Stop timer when we have 4 photos (e.g. from manual + timed mix, or race)
  useEffect(() => {
    if (photos.length >= PHOTO_COUNT && timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
      setTimerStarted(false)
      setCountdown(null)
    }
  }, [photos.length])

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
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {onBack && (
        <div className="flex justify-start mb-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 hover:bg-white text-slate-700 font-medium text-base ring-1 ring-slate-300/80 shadow-sm transition-all"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      )}
      <p className="text-center text-slate-800 text-lg sm:text-xl font-medium">
        Take {PHOTO_COUNT} photos ({photos.length}/{PHOTO_COUNT})
      </p>

      <div className="flex justify-center gap-3">
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
          className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-xl text-base font-semibold transition-all ${
            captureMode === 'manual'
              ? 'btn-primary text-white shadow-lg'
              : 'bg-violet-200/80 text-slate-800 hover:bg-violet-200 ring-2 ring-violet-200'
          }`}
        >
          <Camera className="w-5 h-5" />
          Manual
        </button>
        <button
          type="button"
          onClick={() => setCaptureMode('timed')}
          disabled={full || timerStarted}
          className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-xl text-base font-semibold transition-all ${
            captureMode === 'timed'
              ? 'btn-primary text-white shadow-lg'
              : 'bg-violet-200/80 text-slate-800 hover:bg-violet-200 ring-2 ring-violet-200'
          } disabled:opacity-50 disabled:pointer-events-none`}
        >
          <Timer className="w-5 h-5" />
          {TIMER_INTERVAL_SEC}s auto
        </button>
      </div>

      <div className="card-fun p-4 sm:p-5">
        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: PHOTO_COUNT }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => full && setSelectedForRetake(i)}
              disabled={!full}
              className={`aspect-square rounded-2xl overflow-hidden flex items-center justify-center transition-all ${
                full
                  ? selectedForRetake === i
                    ? 'ring-2 ring-violet-600 ring-offset-2 ring-offset-[#e8e4ef] shadow-lg shadow-violet-500/30'
                    : 'ring-2 ring-slate-500 hover:ring-violet-500'
                  : 'ring-2 ring-slate-400 bg-slate-300/90'
              } disabled:pointer-events-none`}
            >
              {photos[i] ? (
                <img
                  src={photos[i]}
                  alt={`Photo ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-slate-700 text-xl font-bold">{i + 1}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {captureMode === 'timed' && timerStarted && countdown !== null && photos.length < PHOTO_COUNT && (
        <div className="card-fun text-center py-6 px-6">
          <p className="text-slate-700 text-lg mb-2">Next photo in</p>
          <p className="text-5xl sm:text-6xl font-bold text-slate-900 tabular-nums">{countdown}s</p>
        </div>
      )}

      {captureMode === 'timed' && !timerStarted && !full && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={startTimerCapture}
            disabled={!videoReady}
            className="btn-primary inline-flex items-center gap-3 px-8 py-4 rounded-2xl disabled:opacity-50 text-white text-lg font-bold"
          >
            <Timer className="w-6 h-6" />
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
            className="btn-primary inline-flex items-center gap-3 px-8 py-4 rounded-2xl disabled:opacity-50 text-white text-lg font-bold"
          >
            <Camera className="w-6 h-6" />
            {capturing ? 'Capturing…' : 'Take Photo'}
          </button>
        </div>
      )}

      {full && (
        <div className="flex flex-wrap gap-4 justify-center items-center">
          {selectedForRetake !== null && (
            <button
              type="button"
              onClick={handleRetakeCapture}
              disabled={!videoReady || capturing}
              className="btn-primary inline-flex items-center gap-3 px-8 py-4 rounded-2xl disabled:opacity-50 text-white text-lg font-bold"
            >
              <RotateCcw className="w-6 h-6" />
              {capturing ? 'Capturing…' : `Retry photo ${selectedForRetake + 1}`}
            </button>
          )}
          <button
            type="button"
            onClick={() => onNext(photos)}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-violet-300/90 hover:bg-violet-300 text-slate-900 text-lg font-bold ring-2 ring-violet-200 shadow-md hover:shadow-lg transition-all"
          >
            Next
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

      {full && selectedForRetake === null && (
        <p className="text-center text-slate-600 text-base sm:text-lg">
          Click a photo to select it, then Retry to retake that one.
        </p>
      )}
    </div>
  )
}
