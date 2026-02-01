import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { FRAME_DESIGNS, renderFrameStrip, STRIP_WIDTH } from '../utils/frameDesigns'

const PREVIEW_WIDTH = 120

export default function FrameSelectScreen({ photos, onNext, onBack }) {
  const [selectedFrameId, setSelectedFrameId] = useState(FRAME_DESIGNS[0]?.id ?? null)
  const [previews, setPreviews] = useState({}) // frameId -> dataUrl
  const [generating, setGenerating] = useState(false)

  // Generate preview thumbnails for each frame design
  useEffect(() => {
    if (!photos || photos.length !== 4) return
    let cancelled = false
    const load = async () => {
      const next = {}
      const dateOpt = { date: new Date() }
      for (const design of FRAME_DESIGNS) {
        if (cancelled) return
        try {
          const url = await renderFrameStrip(photos, design, PREVIEW_WIDTH, dateOpt)
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
      const url = await renderFrameStrip(photos, design, STRIP_WIDTH, { date: new Date() })
      if (url) onNext(url)
    } finally {
      setGenerating(false)
    }
  }

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
      <div className="text-center">
        <p className="text-slate-800 text-xl sm:text-2xl font-bold">Choose a frame design</p>
        <p className="text-slate-600 text-base sm:text-lg mt-1">All 4 photos in one strip</p>
      </div>

      <div className="grid grid-cols-4 gap-4 sm:gap-5">
        {FRAME_DESIGNS.map((design) => {
          const isSelected = selectedFrameId === design.id
          return (
            <button
              key={design.id}
              type="button"
              onClick={() => setSelectedFrameId(design.id)}
              className={`card-fun rounded-2xl overflow-hidden transition-all flex flex-col items-center p-2 relative ${
                isSelected
                  ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-[#e2dfe8] frame-option-selected scale-[1.02]'
                  : 'ring-2 ring-slate-300/80 hover:ring-violet-400 frame-option-unselected'
              }`}
            >
              {isSelected && (
                <span className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-full bg-violet-500 px-2 py-0.5 text-xs font-bold text-white shadow-md">
                  <Check className="w-3.5 h-3.5" />
                  Selected
                </span>
              )}
              <div
                className="w-full aspect-[2/3] flex items-center justify-center rounded-xl overflow-hidden bg-slate-200/50"
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
              <span className="py-3 text-slate-800 text-base font-bold">{design.name}</span>
            </button>
          )
        })}
      </div>

      {selectedFrameId && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleNext}
            disabled={generating}
            className="btn-primary inline-flex items-center gap-3 px-8 py-4 rounded-2xl disabled:opacity-50 text-white text-lg font-bold"
          >
            {generating ? (
              <span className="inline-block w-6 h-6 border-2 border-white/60 border-t-white rounded-full animate-spin" />
            ) : (
              <ChevronRight className="w-6 h-6" />
            )}
            Next
          </button>
        </div>
      )}
    </div>
  )
}
