import { useState } from 'react'
import { Camera, ChevronRight } from 'lucide-react'

const PHOTO_COUNT = 4

export default function BoothScreen({
  videoRef,
  stream,
  overlayImage,
  onNext,
}) {
  const [photos, setPhotos] = useState([])
  const [capturing, setCapturing] = useState(false)

  function takePhoto() {
    const video = videoRef?.current
    if (!video || video.readyState < 2 || photos.length >= PHOTO_COUNT) return
    setCapturing(true)
    const w = video.videoWidth
    const h = video.videoHeight
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
  }

  const full = photos.length >= PHOTO_COUNT
  const videoReady = videoRef?.current && videoRef.current.readyState >= 2

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <p className="text-center text-white/70 text-sm">
        Take {PHOTO_COUNT} photos ({photos.length}/{PHOTO_COUNT})
      </p>
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
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          type="button"
          onClick={takePhoto}
          disabled={!videoReady || capturing || full}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:pointer-events-none font-medium transition-colors"
        >
          <Camera className="w-5 h-5" />
          {capturing ? 'Capturing…' : full ? 'Done' : 'Take Photo'}
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
