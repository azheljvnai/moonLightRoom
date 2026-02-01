import { AlertCircle, X } from 'lucide-react'

export default function ErrorModal({ title, message, onClose }) {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="error-modal-title"
      aria-describedby="error-modal-desc"
      className="fixed inset-0 z-50 w-screen h-screen min-w-full min-h-full flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-auto"
      style={{ width: '100vw', height: '100dvh', minHeight: '100vh' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-slate-800/98 ring-2 ring-violet-400/60 shadow-2xl shadow-black/50 p-8 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-violet-400" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h2
              id="error-modal-title"
              className="text-xl font-bold text-white mb-2"
            >
              {title}
            </h2>
            <p
              id="error-modal-desc"
              className="text-base text-white/85 leading-relaxed"
            >
              {message}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-base transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}
