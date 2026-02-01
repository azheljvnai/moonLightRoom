import { Camera } from 'lucide-react'

export default function StartScreen({ onStart, loading }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-10">
        <div
          className="absolute inset-0 rounded-full blur-3xl opacity-40 animate-[gentle-bounce_3s_ease-in-out_infinite]"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.45) 0%, transparent 70%)',
          }}
        />
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center ring-4 ring-violet-300/70 shadow-2xl shadow-violet-400/40 rotate-3 hover:rotate-6 transition-transform duration-300">
          <Camera className="w-14 h-14 sm:w-16 sm:h-16 text-white" strokeWidth={1.5} />
        </div>
      </div>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 mb-3">
        Moon Light Room
      </h1>
      <p className="text-slate-700 text-xl sm:text-2xl max-w-md mx-auto mb-12 leading-relaxed">
        Photo booth. Take four photos, pick your frame, then get your keepsake.
      </p>
      <button
        type="button"
        onClick={onStart}
        disabled={loading}
        className="btn-primary group px-12 py-5 rounded-2xl disabled:opacity-60 disabled:pointer-events-none text-white text-xl font-bold transition-all duration-300 flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98]"
      >
        {loading ? (
          <span className="inline-block w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin" />
        ) : (
          <Camera className="w-7 h-7" />
        )}
        <span>{loading ? 'Starting…' : 'Start'}</span>
      </button>
    </div>
  )
}
