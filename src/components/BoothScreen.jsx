import { useState, useRef } from 'react'
import { Camera, ChevronRight, Timer } from 'lucide-react'

const PHOTO_COUNT = 4
const COUNTDOWN_SEC = 3

export default function BoothScreen({
  videoRef,
  videoReady,
  stream,
  overlayImage,
  onNext,
}) {
  const [photos, setPhotos] = useState([])
  const [capturing, setCapturing] = useState(false)
  const [captureMode, setCaptureMode] = useState('manual') // 'manual' | 'timed'
  const [countdown, setCountdown] = useState(null)
  const countdownTimerRef = useRef(null)

  function captureFrame() {
    const video = videoRef?.current
    if (!video || video.readyState < 2) return
    const w = video.videoWidth
    const h = video.videoHeight
    if (w === 0 || h === 0) return
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
    const dataUrl = canvas.toDataURL('image/png')
    setPhotos((prev) => [...prev, dataUrl])
    setCapturing(false)
    setCountdown(null)
  }

  function takePhoto() {
    if (!videoReady || photos.length >= PHOTO_COUNT) return
    if (captureMode === 'manual') {
      setCapturing(true)
      requestAnimationFrame(() => requestAnimationFrame(captureFrame))
      return
    }
    // Timed: 3, 2, 1 then capture
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
    let sec = COUNTDOWN_SEC
    setCountdown(sec)
    countdownTimerRef.current = setInterval(() => {
      sec -= 1
      setCountdown(sec)
      if (sec <= 0) {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current)
          countdownTimerRef.current = null
        }
        setCapturing(true)
        requestAnimationFrame(() => requestAnimationFrame(captureFrame))
      }
    }, 1000)
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
          onClick={() => setCaptureMode('manual')}
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
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            captureMode === 'timed'
              ? 'bg-rose-600 text-white'
              : 'bg-white/10 text-white/80 hover:bg-white/20'
          }`}
        >
          <Timer className="w-4 h-4" />
          {COUNTDOWN_SEC}s timer
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4">
        {Array.from({ length: PHOTO_COUNT }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl overflow-hidden bg-black/50 ring-1 ring-white/10 flex items-center justify-center"
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
          </div>
        ))}
      </div>

      {countdown !== null && countdown > 0 && (
        <div className="text-center text-4xl font-bold text-white/90 tabular-nums">
          {countdown}
        </div>
      )}

      <div className="flex flex-wrap gap-3 justify-center">
        <button
          type="button"
          onClick={takePhoto}
          disabled={!videoReady || capturing || full || (countdown !== null && countdown > 0)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:pointer-events-none font-medium transition-colors"
        >
          <Camera className="w-5 h-5" />
          {capturing ? 'Capturing…' : full ? 'Done' : countdown ? `${countdown}…` : 'Take Photo'}
        </button>
        {full && (
          <button
            type="button"
            onClick={() => onNext(photos)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/15 hover:bg-white/25 font-medium transition-colors"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
