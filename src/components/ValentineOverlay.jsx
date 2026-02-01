import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Heart } from 'lucide-react'
import confetti from 'canvas-confetti'

/* More realistic lotus flower SVG – layered petals, central pod, glowing via filter */
function LotusFlower({ size = 64, colorClass = 'text-fuchsia-400', className = '', style = {} }) {
  const s = size
  const c = s / 2
  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      className={`neon-lotus ${colorClass} ${className}`}
      style={style}
      aria-hidden
    >
      {/* Outer layer – 12 broad, rounded petals (lotus-like), glowing via CSS .neon-lotus */}
      {[...Array(12)].map((_, i) => (
        <ellipse
          key={`o-${i}`}
          cx={c}
          cy={c}
          rx={c * 0.42}
          ry={c * 0.58}
          fill="currentColor"
          opacity="0.9"
          transform={`rotate(${i * 30} ${c} ${c})`}
        />
      ))}
      {/* Middle layer – 8 petals, slightly smaller */}
      {[...Array(8)].map((_, i) => (
        <ellipse
          key={`m-${i}`}
          cx={c}
          cy={c}
          rx={c * 0.28}
          ry={c * 0.4}
          fill="currentColor"
          opacity="0.95"
          transform={`rotate(${i * 45 + 15} ${c} ${c})`}
        />
      ))}
      {/* Inner layer – 6 petals */}
      {[...Array(6)].map((_, i) => (
        <ellipse
          key={`i-${i}`}
          cx={c}
          cy={c}
          rx={c * 0.16}
          ry={c * 0.28}
          fill="currentColor"
          opacity="0.98"
          transform={`rotate(${i * 60 + 25} ${c} ${c})`}
        />
      ))}
      {/* Central seed pod (flat top) */}
      <circle cx={c} cy={c} r={c * 0.2} fill="currentColor" opacity="1" />
      <ellipse cx={c} cy={c - c * 0.05} rx={c * 0.18} ry={c * 0.12} fill="currentColor" opacity="0.9" />
    </svg>
  )
}

/* Blue glowing flower for bouquet (simple rose-like) */
function BlueFlower({ size = 40, className = '' }) {
  const c = size / 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={`neon-lotus text-blue-400 ${className}`} aria-hidden>
      {[...Array(8)].map((_, i) => (
        <ellipse
          key={i}
          cx={c}
          cy={c}
          rx={c * 0.35}
          ry={c * 0.5}
          fill="currentColor"
          opacity="0.92"
          transform={`rotate(${i * 45} ${c} ${c})`}
        />
      ))}
      <circle cx={c} cy={c} r={c * 0.2} fill="currentColor" opacity="1" />
    </svg>
  )
}

/* Bouquet: blue flowers + lotuses, bottom center */
function BlueBouquet() {
  const bluePositions = [
    { x: 48, y: 72, size: 44 },
    { x: 42, y: 78, size: 36 },
    { x: 54, y: 76, size: 38 },
    { x: 38, y: 74, size: 32 },
    { x: 58, y: 74, size: 32 },
    { x: 50, y: 82, size: 40 },
    { x: 46, y: 68, size: 28 },
    { x: 52, y: 70, size: 28 },
  ]
  const lotusAroundBouquet = [
    { x: 28, y: 75, size: 52, color: 'text-fuchsia-400', sway: true },
    { x: 70, y: 74, size: 48, color: 'text-violet-400', sway: true },
    { x: 32, y: 88, size: 42, color: 'text-cyan-300', sway: false },
    { x: 66, y: 86, size: 44, color: 'text-fuchsia-300', sway: false },
    { x: 22, y: 82, size: 38, color: 'text-violet-300', sway: true },
    { x: 76, y: 80, size: 40, color: 'text-cyan-400', sway: true },
    { x: 38, y: 62, size: 36, color: 'text-fuchsia-400', sway: false },
    { x: 60, y: 64, size: 36, color: 'text-violet-400', sway: false },
  ]
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Blue bouquet cluster – bottom center */}
      {bluePositions.map((pos, i) => (
        <div
          key={`b-${i}`}
          className="absolute"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: `translate(-50%, -50%) rotate(${(i % 3) * 6 - 6}deg)`,
          }}
        >
          <BlueFlower size={pos.size} />
        </div>
      ))}
      {/* Larger lotuses around the bouquet */}
      {lotusAroundBouquet.map((pos, i) => (
        <div
          key={`l-${i}`}
          className="lotus-wrap absolute cursor-pointer pointer-events-auto"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: 'translate(-50%, -50%)',
            animation: pos.sway ? 'lotus-sway 4s ease-in-out infinite' : undefined,
            animationDelay: `${i * 0.15}s`,
          }}
        >
          <LotusFlower size={pos.size} colorClass={pos.color} />
        </div>
      ))}
    </div>
  )
}

const PROMPTS = [
  'Will you be my Valentine?',
  'Bakit hindi? Pleaseeee!!',
  'Please go out with me?',
  'Pretty please?',
  "I'll make you the happiest! Say yes?",
  'Sige na?',
]

function fireConfetti() {
  const count = 120
  const defaults = { origin: { y: 0.65 }, zIndex: 9999 }
  confetti({
    ...defaults,
    particleCount: count * 0.4,
    spread: 80,
    colors: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#e9d5ff'],
  })
  confetti({ ...defaults, particleCount: count * 0.3, angle: 60, spread: 55 })
  confetti({ ...defaults, particleCount: count * 0.3, angle: 120, spread: 55 })
  setTimeout(() => {
    confetti({ ...defaults, particleCount: count * 0.2, scalar: 1.2, spread: 100 })
  }, 200)
}

function ValentineOverlay({ visible, onDismiss }) {
  const [step, setStep] = useState(0)
  const [showThankYou, setShowThankYou] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!visible) return null

  const isLastStep = step >= PROMPTS.length - 1
  const text = PROMPTS[step]

  function handleYes(e) {
    e.stopPropagation()
    fireConfetti()
    setShowThankYou(true)
  }

  function handleNo(e) {
    e.stopPropagation()
    if (isLastStep) return
    setStep((s) => s + 1)
  }

  function handleSigeNa(e) {
    e.stopPropagation()
    fireConfetti()
    setShowThankYou(true)
  }

  function handleOverlayClick() {
    if (showThankYou) onDismiss()
  }

  const overlayContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={showThankYou ? undefined : 'valentine-question'}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[9999] w-screen h-screen min-w-full min-h-full flex flex-col items-center justify-center focus:outline-none cursor-pointer overflow-auto"
      style={{
        width: '100vw',
        height: '100dvh',
        minHeight: '100vh',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(165deg, #1a0a14 0%, #2d1525 25%, #1f0f1a 50%, #251520 75%, #180a12 100%)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Sweet Valentine ambient glow – rose & pink */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 100% 60% at 50% 20%, rgba(244, 114, 182, 0.18) 0%, transparent 55%),
            radial-gradient(ellipse 80% 80% at 50% 60%, rgba(236, 72, 153, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse 70% 50% at 20% 80%, rgba(219, 39, 119, 0.1) 0%, transparent 45%),
            radial-gradient(ellipse 70% 50% at 80% 75%, rgba(244, 114, 182, 0.1) 0%, transparent 45%),
            radial-gradient(ellipse 60% 40% at 50% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)
          `,
        }}
      />

      {!showThankYou && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            { left: '10%', top: '15%' },
            { right: '10%', top: '18%' },
            { left: '6%', bottom: '22%' },
            { right: '8%', bottom: '26%' },
            { left: '20%', top: '6%' },
            { right: '18%', bottom: '10%' },
            { left: '50%', top: '8%', transform: 'translateX(-50%)' },
            { left: '50%', bottom: '12%', transform: 'translateX(-50%)' },
            { left: '4%', top: '45%' },
            { right: '4%', top: '48%' },
          ].map((pos, i) => (
            <Heart
              key={i}
              className="absolute w-9 h-9 sm:w-11 sm:h-11 text-rose-400/80 animate-[float-heart_2.5s_ease-in-out_infinite] fill-rose-400/60"
              style={{
                ...pos,
                animationDelay: `${i * 0.2}s`,
                filter: 'drop-shadow(0 0 8px rgba(244, 114, 182, 0.4))',
              }}
              aria-hidden
            />
          ))}
        </div>
      )}

      {showThankYou ? (
        <>
          <BlueBouquet />
          {/* Sweet Valentine card sticking out from bouquet – lace/ribbon feel */}
          <div
            className="thank-you-card relative z-20 mt-0 mx-4 rounded-2xl px-8 py-6 sm:px-10 sm:py-8 max-w-md border-2 overflow-hidden"
            style={{
              transform: 'translateY(-8vh) rotate(-1.5deg)',
              marginBottom: '2rem',
              background: 'linear-gradient(165deg, #fef2f7 0%, #fce7f3 35%, #fbcfe8 100%)',
              borderColor: 'rgba(251, 207, 232, 0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-rose-300 to-transparent opacity-80" />
            <p className="text-center text-rose-600/90 text-sm font-medium tracking-widest mb-2">XOXO</p>
            <p
              id="thank-you-message"
              className="thank-you-card-inner text-center text-2xl sm:text-3xl md:text-4xl font-bold text-rose-900 leading-tight"
            >
              Thank you so much, my forever valentine!
              {' '}
              <Heart className="inline-block w-7 h-7 sm:w-8 sm:h-8 text-rose-500 fill-rose-500 align-middle drop-shadow-sm" aria-hidden />
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-rose-300 to-transparent opacity-80" />
          </div>
          <p className="relative z-20 text-rose-200 text-base sm:text-lg font-medium mt-4">
            Tap anywhere to continue
          </p>
        </>
      ) : (
        <>
          {/* Decorative frame around the question – sweet Valentine feel */}
          <div
            className="relative rounded-3xl px-8 py-6 sm:px-12 sm:py-8 max-w-xl mx-4"
            style={{
              background: 'linear-gradient(145deg, rgba(253, 242, 248, 0.08) 0%, rgba(251, 207, 232, 0.06) 50%, transparent 100%)',
              boxShadow: 'inset 0 0 60px rgba(244, 114, 182, 0.08), 0 0 40px rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(251, 207, 232, 0.2)',
            }}
          >
            <p
              id="valentine-question"
              className="relative text-center text-2xl sm:text-4xl md:text-5xl font-semibold text-white px-4 max-w-lg leading-tight animate-[soft-glow_2s_ease-in-out_infinite]"
              style={{
                fontFamily: 'var(--font-serif)',
                textShadow: '0 0 24px rgba(244, 114, 182, 0.5), 0 0 48px rgba(139, 92, 246, 0.35), 0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              {text}
              {' '}
              <Heart
                className="inline-block w-8 h-8 sm:w-10 sm:h-10 text-rose-400 fill-rose-400 animate-[heart-pulse_1.5s_ease-in-out_infinite] align-middle drop-shadow-[0_0_12px_rgba(244,114,182,0.6)]"
                aria-hidden
              />
            </p>
          </div>
          <p className="relative mt-4 text-rose-300/80 text-sm sm:text-base font-medium tracking-wide">
            With love
          </p>

          <div className="relative mt-8 flex flex-wrap gap-4 justify-center items-center" onClick={(e) => e.stopPropagation()}>
            {!isLastStep && (
              <>
                <button
                  type="button"
                  onClick={handleYes}
                  className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-white text-xl sm:text-2xl font-bold transition-all hover:scale-105 shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                    boxShadow: '0 4px 20px rgba(236, 72, 153, 0.45), 0 0 20px rgba(244, 114, 182, 0.2)',
                  }}
                >
                  <Heart className="w-6 h-6 fill-current" />
                  Yes
                </button>
                <button
                  type="button"
                  onClick={handleNo}
                  className="px-8 py-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white/90 text-lg font-semibold transition-all border border-white/20"
                >
                  No
                </button>
              </>
            )}
            {isLastStep && (
              <button
                type="button"
                onClick={handleSigeNa}
                className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-white text-xl sm:text-2xl font-bold transition-all hover:scale-105 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                  boxShadow: '0 4px 20px rgba(236, 72, 153, 0.45), 0 0 20px rgba(244, 114, 182, 0.2)',
                }}
              >
                <Heart className="w-6 h-6 fill-current" />
                Sige na nga
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )

  return mounted ? createPortal(overlayContent, document.body) : null
}

export default ValentineOverlay
