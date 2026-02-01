import { ChevronLeft, Image, Video } from 'lucide-react'

export default function EndScreen({ finalPhotoUrl, recordedUrl, recordedFilename, onBack }) {
  function downloadPhoto() {
    if (!finalPhotoUrl) return
    const a = document.createElement('a')
    a.href = finalPhotoUrl
    a.download = `moon-light-room-${Date.now()}.png`
    a.click()
  }

  function downloadVideo() {
    if (!recordedUrl) return
    const a = document.createElement('a')
    a.href = recordedUrl
    a.download = recordedFilename || `moon-light-room-${Date.now()}.webm`
    a.click()
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-10 py-10">
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
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">All set</h2>
        <p className="text-slate-600 text-lg">Grab your keepsakes below.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        {finalPhotoUrl && (
          <button
            type="button"
            onClick={downloadPhoto}
            className="card-fun flex flex-col items-center gap-4 p-8 rounded-2xl hover:shadow-xl transition-all text-left w-full group"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Image className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
            <span className="font-bold text-slate-900 text-lg">Download photo</span>
            <span className="text-slate-600 text-base">PNG with frame</span>
          </button>
        )}
        {recordedUrl && (
          <button
            type="button"
            onClick={downloadVideo}
            className="card-fun flex flex-col items-center gap-4 p-8 rounded-2xl hover:shadow-xl transition-all text-left w-full group"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Video className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
            <span className="font-bold text-slate-900 text-lg">Download video</span>
            <span className="text-slate-600 text-base">WebM reaction</span>
          </button>
        )}
      </div>
      {finalPhotoUrl && (
        <div className="card-fun rounded-2xl overflow-hidden p-2 vignette">
          <img
            src={finalPhotoUrl}
            alt="Your photo"
            className="w-full max-h-80 object-contain block rounded-xl"
          />
        </div>
      )}
    </div>
  )
}
