import { Image, Video } from 'lucide-react'

export default function EndScreen({ finalPhotoUrl, recordedUrl, recordedFilename }) {
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
    <div className="w-full max-w-lg mx-auto space-y-8 py-8">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">All set</h2>
        <p className="text-white/60">Download your photo and reaction video below.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {finalPhotoUrl && (
          <button
            type="button"
            onClick={downloadPhoto}
            className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-white/10 ring-1 ring-white/10 transition-colors text-left w-full"
          >
            <div className="w-14 h-14 rounded-full bg-rose-600/20 flex items-center justify-center">
              <Image className="w-7 h-7 text-rose-400" strokeWidth={1.5} />
            </div>
            <span className="font-medium text-white">Download photo</span>
            <span className="text-sm text-white/50">PNG with frame</span>
          </button>
        )}
        {recordedUrl && (
          <button
            type="button"
            onClick={downloadVideo}
            className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-white/10 ring-1 ring-white/10 transition-colors text-left w-full"
          >
            <div className="w-14 h-14 rounded-full bg-rose-600/20 flex items-center justify-center">
              <Video className="w-7 h-7 text-rose-400" strokeWidth={1.5} />
            </div>
            <span className="font-medium text-white">Download video</span>
            <span className="text-sm text-white/50">WebM reaction</span>
          </button>
        )}
      </div>
      {finalPhotoUrl && (
        <div className="rounded-xl overflow-hidden bg-black/40 ring-1 ring-white/10 vignette">
          <img
            src={finalPhotoUrl}
            alt="Your photo"
            className="w-full max-h-64 object-contain block"
          />
        </div>
      )}
    </div>
  )
}
