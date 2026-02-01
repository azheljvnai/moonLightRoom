import { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'

export default function FrameSelectScreen({ photos, overlayImage, onNext }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [finalUrl, setFinalUrl] = useState(null)

  useEffect(() => {
    const src = photos[selectedIndex]
    if (!src) {
      setFinalUrl(null)
      return
    }
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      if (overlayImage?.complete && overlayImage.naturalWidth) {
        ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height)
      }
      setFinalUrl(canvas.toDataURL('image/png'))
    }
    img.src = src
    return () => {
      img.src = ''
    }
  }, [photos, selectedIndex, overlayImage])

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <p className="text-center text-white/70 text-sm">Choose your favorite frame</p>
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {photos.map((url, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelectedIndex(i)}
            className={`aspect-square rounded-xl overflow-hidden ring-2 transition-all ${
              selectedIndex === i
                ? 'ring-rose-500 ring-offset-2 ring-offset-[#0a0508]'
                : 'ring-white/20 hover:ring-white/40'
            }`}
          >
            <img src={url} alt={`Frame ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      {finalUrl && (
        <div className="rounded-xl overflow-hidden bg-black/60 ring-1 ring-white/10 vignette relative">
          <img
            src={finalUrl}
            alt="Selected with frame"
            className="w-full max-h-[50vh] object-contain mx-auto block"
          />
        </div>
      )}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => onNext(finalUrl)}
          disabled={!finalUrl}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 font-medium transition-colors"
        >
          Next
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
