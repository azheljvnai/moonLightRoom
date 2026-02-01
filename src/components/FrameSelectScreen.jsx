import { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import { FRAME_DESIGNS, renderFrameStrip, STRIP_WIDTH } from '../utils/frameDesigns'

const PREVIEW_WIDTH = 120

export default function FrameSelectScreen({ photos, onNext }) {
  const [selectedFrameId, setSelectedFrameId] = useState(FRAME_DESIGNS[0]?.id ?? null)
  const [previews, setPreviews] = useState({}) // frameId -> dataUrl
  const [generating, setGenerating] = useState(false)

  // Generate preview thumbnails for each frame design
  useEffect(() => {
    if (!photos || photos.length !== 4) return
    let cancelled = false
    const load = async () => {
      const next = {}
      for (const design of FRAME_DESIGNS) {
        if (cancelled) return
        try {
          const url = await renderFrameStrip(photos, design, PREVIEW_WIDTH)
          if (url && !cancelled) next[design.id] = url
        } catch (_) {}
      }
      if (!cancelled) setPreviews((p) => ({ ...p, ...next }))
    }
    load()
    return () => { cancelled = true }
  }, [photos])

  async function handleNext() {
    const design = FRAME_DESIGNS.find((d) => d.id === selectedFrameId)
    if (!design || !photos || photos.length !== 4) return
    setGenerating(true)
    try {
      const url = await renderFrameStrip(photos, design, STRIP_WIDTH)
      if (url) onNext(url)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <p className="text-center text-white/70 text-sm">Choose a frame design</p>
      <p className="text-center text-white/50 text-xs">All 4 photos in one strip</p>

      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {FRAME_DESIGNS.map((design) => (
          <button
            key={design.id}
            type="button"
            onClick={() => setSelectedFrameId(design.id)}
            className={`rounded-xl overflow-hidden ring-2 transition-all flex flex-col items-center ${
              selectedFrameId === design.id
                ? 'ring-rose-500 ring-offset-2 ring-offset-[#0a0508]'
                : 'ring-white/20 hover:ring-white/40'
            }`}
          >
            <div
              className="w-full aspect-[2/3] flex items-center justify-center bg-black/30"
              style={{ minHeight: 140 }}
            >
              {previews[design.id] ? (
                <img
                  src={previews[design.id]}
                  alt={design.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div
                  className="w-full h-full min-h-[120px] rounded-lg"
                  style={{ backgroundColor: design.bg }}
                />
              )}
            </div>
            <span className="py-2 text-white/80 text-xs font-medium">{design.name}</span>
          </button>
        ))}
      </div>

      {selectedFrameId && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleNext}
            disabled={generating}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 font-medium transition-colors"
          >
            {generating ? (
              <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
            Next
          </button>
        </div>
      )}
    </div>
  )
}
