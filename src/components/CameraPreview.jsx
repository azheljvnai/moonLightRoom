import { forwardRef, useEffect, useRef } from 'react'

const CameraPreview = forwardRef(function CameraPreview(
  { stream, error, loading, onVideoReady },
  ref
) {
  const videoRef = useRef(null)
  const setVideoRef = (el) => {
    videoRef.current = el
    if (typeof ref === 'function') ref(el)
    else if (ref) ref.current = el
  }

  useEffect(() => {
    if (!stream || !videoRef.current) return
    const video = videoRef.current
    video.srcObject = stream
    video.play().catch(() => {})

    function markReady() {
      onVideoReady?.()
    }
    if (video.readyState >= 2) markReady()
    video.addEventListener('loadeddata', markReady)
    video.addEventListener('canplay', markReady)
    return () => {
      video.removeEventListener('loadeddata', markReady)
      video.removeEventListener('canplay', markReady)
    }
  }, [stream, onVideoReady])

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto rounded-xl overflow-hidden bg-black/60 border border-rose-500/40 p-6 sm:p-8 text-center">
        <div className="text-rose-300 text-lg sm:text-xl font-semibold mb-2">Camera access required</div>
        <p className="text-white/70 text-sm sm:text-base">{error}</p>
        <p className="text-white/50 text-xs sm:text-sm mt-4">
          Check your browser permissions and try again.
        </p>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-xl overflow-hidden bg-black shadow-lg ring-1 ring-white/10 aspect-video min-h-[200px] sm:min-h-[280px] flex items-center justify-center vignette">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 z-10">
          <span className="text-white/70 text-sm sm:text-base">Starting camera…</span>
        </div>
      )}
      <video
        ref={setVideoRef}
        playsInline
        muted
        autoPlay
        className="w-full h-full object-cover scale-x-[-1]"
        aria-label="Live camera preview"
      />
    </div>
  )
})

export default CameraPreview
