import { useRef, useState, useEffect } from 'react'

const AUDIO_SRC = '/audio/background.mp3'

function BackgroundAudio() {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControl, setShowControl] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 0.25
  }, [])

  function toggleMusic() {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => setHasError(true))
    }
  }

  if (hasError) return null

  return (
    <>
      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        loop
        preload="metadata"
        onError={() => setHasError(true)}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        aria-label="Background music"
      />
      {showControl && (
        <button
          type="button"
          onClick={toggleMusic}
          className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-sm px-4 py-2.5 text-sm text-white/90 ring-1 ring-white/20 hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
          aria-label={isPlaying ? 'Pause background music' : 'Play background music'}
        >
          {isPlaying ? (
            <>
              <span className="text-base" aria-hidden>🔊</span>
              <span>Music on</span>
            </>
          ) : (
            <>
              <span className="text-base opacity-70" aria-hidden>🔇</span>
              <span>Play music</span>
            </>
          )}
        </button>
      )}
    </>
  )
}

export default BackgroundAudio
