import { useRef, useState, useEffect } from 'react'

const OVERLAY_SRC = '/frames/red-moon-frame.png'
const LAST_PHOTO_KEY = 'moonLightRoom_lastPhoto'
const MAX_PHOTO_STORAGE = 4 * 1024 * 1024 // ~4MB for data URL

function PhotoCapture({ videoRef, onPhotoCaptured, autoDownload = true }) {
  const [overlayImage, setOverlayImage] = useState(null)
  const [overlayError, setOverlayError] = useState(false)
  const [capturedUrl, setCapturedUrl] = useState(null)
  const [capturing, setCapturing] = useState(false)
  const [lastCachedUrl, setLastCachedUrl] = useState(null)

  useEffect(() => {
    const img = new Image()
    img.onload = () => setOverlayImage(img)
    img.onerror = () => setOverlayError(true)
    img.src = OVERLAY_SRC
    return () => {
      img.src = ''
    }
  }, [])

  // Load last cached photo on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(LAST_PHOTO_KEY)
      if (cached && cached.length < MAX_PHOTO_STORAGE) setLastCachedUrl(cached)
    } catch (_) {}
  }, [])

  function takePhoto() {
    const video = videoRef?.current
    if (!video || video.readyState < 2) return

    setCapturing(true)
    const w = video.videoWidth
    const h = video.videoHeight
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')

    // Draw video frame (mirrored to match preview)
    ctx.save()
    ctx.scale(-1, 1)
    ctx.drawImage(video, -w, 0, w, h)
    ctx.restore()

    // Draw overlay on top
    if (overlayImage?.complete && overlayImage.naturalWidth) {
      ctx.drawImage(overlayImage, 0, 0, w, h)
    }

    const dataUrl = canvas.toDataURL('image/png')
    setCapturedUrl(dataUrl)
    setCapturing(false)
    try {
      if (dataUrl.length < MAX_PHOTO_STORAGE) {
        localStorage.setItem(LAST_PHOTO_KEY, dataUrl)
        setLastCachedUrl(dataUrl)
      }
    } catch (_) {}
    onPhotoCaptured?.()
    if (autoDownload) {
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `moon-light-room-${Date.now()}.png`
      a.click()
    }
  }

  function downloadPhoto() {
    if (!capturedUrl) return
    const a = document.createElement('a')
    a.href = capturedUrl
    a.download = `moon-light-room-${Date.now()}.png`
    a.click()
  }

  function downloadCachedPhoto() {
    if (!lastCachedUrl) return
    const a = document.createElement('a')
    a.href = lastCachedUrl
    a.download = 'moon-light-room-last.png'
    a.click()
  }

  const videoReady = videoRef?.current && videoRef.current.readyState >= 2

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-center">
        <button
          type="button"
          onClick={takePhoto}
          disabled={!videoReady || capturing}
          className="px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:pointer-events-none font-medium text-sm sm:text-base transition-colors"
        >
          {capturing ? 'Capturing…' : 'Take Photo'}
        </button>
        {capturedUrl && (
          <button
            type="button"
            onClick={downloadPhoto}
            className="px-5 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 font-medium text-sm sm:text-base transition-colors"
          >
            Download
          </button>
        )}
      </div>

      {!videoRef && (
        <p className="text-center text-gray-500 text-sm">Connect the camera above to take a photo.</p>
      )}

      {videoRef && !videoReady && (
        <p className="text-center text-gray-500 text-sm">Waiting for camera…</p>
      )}

      {overlayError && (
        <p className="text-center text-amber-500/90 text-sm">
          Frame overlay not found. Add <code className="bg-gray-800 px-1 rounded">red-moon-frame.png</code> to{' '}
          <code className="bg-gray-800 px-1 rounded">public/frames/</code>.
        </p>
      )}

      {capturedUrl && (
        <div className="rounded-xl overflow-hidden bg-black ring-1 ring-white/10 shadow-lg vignette relative">
          <p className="text-center text-white/60 text-sm py-2">Preview</p>
          <img
            src={capturedUrl}
            alt="Captured photo"
            className="w-full h-auto object-contain max-h-[70vh] block"
          />
        </div>
      )}

      {lastCachedUrl && !capturedUrl && (
        <div className="rounded-xl overflow-hidden bg-black/60 ring-1 ring-white/10 p-4 text-center space-y-2">
          <p className="text-white/60 text-sm">Last photo (saved for retakes)</p>
          <img
            src={lastCachedUrl}
            alt="Last saved photo"
            className="w-full max-h-40 object-contain mx-auto rounded-lg block"
          />
          <button
            type="button"
            onClick={downloadCachedPhoto}
            className="px-4 py-2 rounded-lg bg-violet-600/80 hover:bg-violet-500 text-sm font-medium"
          >
            Download last photo
          </button>
        </div>
      )}
    </div>
  )
}

export default PhotoCapture
