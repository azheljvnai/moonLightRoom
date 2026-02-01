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
      <div className="card-fun w-full max-w-2xl mx-auto rounded-2xl overflow-hidden bg-white/90 border-2 border-violet-200 p-8 sm:p-10 text-center">
        <div className="text-slate-800 text-xl sm:text-2xl font-bold mb-3">Camera access required</div>
        <p className="text-slate-800 text-base sm:text-lg">{error}</p>
        <p className="text-slate-600 text-base sm:text-lg mt-5">
          Check your browser permissions and try again.
        </p>
      </div>
    )
  }

  return (
    <div className="card-fun relative w-full max-w-2xl mx-auto rounded-2xl overflow-hidden bg-black shadow-xl ring-2 ring-violet-200/80 aspect-video min-h-[200px] sm:min-h-[280px] flex items-center justify-center vignette">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-violet-950/90 z-10 rounded-2xl">
          <span className="text-violet-200 text-lg sm:text-xl font-medium">Starting camera…</span>
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
