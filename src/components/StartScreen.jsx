import { Camera } from 'lucide-react'

export default function StartScreen({ onStart, loading }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-8">
        <div
          className="absolute inset-0 rounded-full blur-3xl opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(244, 63, 94, 0.4) 0%, transparent 70%)',
          }}
        />
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full bg-gradient-to-br from-rose-600/90 to-rose-900/90 flex items-center justify-center ring-4 ring-rose-500/30 shadow-2xl">
          <Camera className="w-12 h-12 sm:w-14 sm:h-14 text-white" strokeWidth={1.5} />
        </div>
      </div>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
        Moon Light Room
      </h1>
      <p className="text-white/60 text-lg sm:text-xl max-w-sm mx-auto mb-10">
        ENHYPEN-inspired photo booth. Take four photos, pick your frame, then get your keepsake.
      </p>
      <button
        type="button"
        onClick={onStart}
        disabled={loading}
        className="group px-10 py-4 rounded-full bg-rose-600 hover:bg-rose-500 disabled:opacity-60 disabled:pointer-events-none text-white text-lg font-semibold shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all duration-300 flex items-center gap-3"
      >
        {loading ? (
          <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          <Camera className="w-6 h-6" />
        )}
        <span>{loading ? 'Starting…' : 'Start'}</span>
      </button>
    </div>
  )
}
