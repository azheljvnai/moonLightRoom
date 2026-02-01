import { Heart } from 'lucide-react'
import confetti from 'canvas-confetti'

function fireConfetti() {
  const count = 120
  const defaults = { origin: { y: 0.65 }, zIndex: 9999 }
  confetti({
    ...defaults,
    particleCount: count * 0.4,
    spread: 80,
    colors: ['#f43f5e', '#fb7185', '#fda4af'],
  })
  confetti({ ...defaults, particleCount: count * 0.3, angle: 60, spread: 55 })
  confetti({ ...defaults, particleCount: count * 0.3, angle: 120, spread: 55 })
  setTimeout(() => {
    confetti({ ...defaults, particleCount: count * 0.2, scalar: 1.2, spread: 100 })
  }, 200)
}

function ValentineOverlay({ visible, onDismiss }) {
  if (!visible) return null

  function handleYes(e) {
    e.stopPropagation()
    fireConfetti()
    onDismiss()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="valentine-question"
      onClick={onDismiss}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm focus:outline-none"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(190, 18, 60, 0.25) 0%, transparent 70%)',
        }}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { left: '12%', top: '18%' },
          { right: '12%', top: '22%' },
          { left: '8%', bottom: '28%' },
          { right: '10%', bottom: '24%' },
          { left: '22%', top: '8%' },
          { right: '20%', bottom: '12%' },
        ].map((pos, i) => (
          <Heart
            key={i}
            className="absolute w-8 h-8 sm:w-10 sm:h-10 text-rose-400/60 animate-[float-heart_2.5s_ease-in-out_infinite] fill-rose-400/40"
            style={{
              ...pos,
              animationDelay: `${i * 0.25}s`,
            }}
            aria-hidden
          />
        ))}
      </div>

      <p
        id="valentine-question"
        className="relative text-center text-2xl sm:text-4xl md:text-5xl font-semibold text-white px-6 max-w-lg leading-tight animate-[soft-glow_2s_ease-in-out_infinite]"
        style={{
          fontFamily: 'var(--font-serif)',
          textShadow: '0 0 30px rgba(244, 63, 94, 0.5), 0 0 60px rgba(244, 63, 94, 0.3)',
        }}
      >
        Will you be my Valentine?{' '}
        <Heart
          className="inline-block w-8 h-8 sm:w-10 sm:h-10 text-rose-400 fill-rose-400 animate-[heart-pulse_1.5s_ease-in-out_infinite] align-middle"
          aria-hidden
        />
      </p>

      <div className="relative mt-8 flex flex-wrap gap-4 justify-center items-center">
        <button
          type="button"
          onClick={handleYes}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-rose-500 hover:bg-rose-400 text-white text-xl font-semibold shadow-lg shadow-rose-500/30 transition-colors"
        >
          <Heart className="w-6 h-6 fill-current" />
          Yes
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDismiss()
          }}
          className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white/80 text-base transition-colors"
        >
          Maybe later
        </button>
      </div>

      <p
        className="relative mt-6 text-sm text-white/50"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        Or tap anywhere to continue
      </p>
    </div>
  )
}

export default ValentineOverlay
