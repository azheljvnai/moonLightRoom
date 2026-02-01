import { useEffect, useRef, useState } from 'react'
import { set as idbSet, get as idbGet } from 'idb-keyval'

const RECORDING_MAX_MS = 18000 // 15–20 sec: use 18
const LAST_VIDEO_KEY = 'moonLightRoom_lastVideo'

function getPreferredMimeType() {
  const types = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ]
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type
  }
  return ''
}

function VideoRecorder({ stream, autoDownload = true }) {
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const autoStopTimerRef = useRef(null)
  const autoDownloadRef = useRef(autoDownload)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedUrl, setRecordedUrl] = useState(null)
  const [recordedFilename, setRecordedFilename] = useState(null)
  const [lastCachedUrl, setLastCachedUrl] = useState(null)
  const [error, setError] = useState(null)

  autoDownloadRef.current = autoDownload

  // Load last cached video on mount
  useEffect(() => {
    idbGet(LAST_VIDEO_KEY).then((blob) => {
      if (blob && blob.size > 0) {
        setLastCachedUrl(URL.createObjectURL(blob))
      }
    })
    return () => {}
  }, [])

  // Start recording when stream is available
  useEffect(() => {
    if (!stream || stream.getVideoTracks().length === 0) return

    const mimeType = getPreferredMimeType()
    const options = mimeType ? { mimeType, videoBitsPerSecond: 2500000, audioBitsPerSecond: 128000 } : {}

    try {
      const recorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        if (chunksRef.current.length === 0) return
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'video/webm' })
        const url = URL.createObjectURL(blob)
        const filename = `moon-light-room-${Date.now()}.webm`
        setRecordedUrl(url)
        setRecordedFilename(filename)
        setIsRecording(false)
        idbSet(LAST_VIDEO_KEY, blob).catch(() => {})
        if (autoDownloadRef.current) {
          const a = document.createElement('a')
          a.href = url
          a.download = filename
          a.click()
        }
      }

      recorder.onerror = (e) => {
        setError(e.error?.message || 'Recording failed')
        setIsRecording(false)
      }

      recorder.start(1000)
      setIsRecording(true)
      setError(null)
      setRecordedUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      setRecordedFilename(null)

      autoStopTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop()
        }
      }, RECORDING_MAX_MS)
    } catch (err) {
      setError(err.message || 'Failed to start recording')
    }

    return () => {
      if (autoStopTimerRef.current) {
        clearTimeout(autoStopTimerRef.current)
        autoStopTimerRef.current = null
      }
      const rec = mediaRecorderRef.current
      if (rec && rec.state !== 'inactive') {
        rec.stop()
      }
      mediaRecorderRef.current = null
      chunksRef.current = []
    }
  }, [stream])

  function stopRecording() {
    const rec = mediaRecorderRef.current
    if (rec && rec.state === 'recording') {
      rec.stop()
    }
  }

  function downloadVideo() {
    if (!recordedUrl) return
    const a = document.createElement('a')
    a.href = recordedUrl
    a.download = recordedFilename || `moon-light-room-${Date.now()}.webm`
    a.click()
  }

  function downloadCachedVideo() {
    if (!lastCachedUrl) return
    const a = document.createElement('a')
    a.href = lastCachedUrl
    a.download = 'moon-light-room-last.webm'
    a.click()
  }

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      if (recordedUrl) URL.revokeObjectURL(recordedUrl)
      if (lastCachedUrl) URL.revokeObjectURL(lastCachedUrl)
    }
  }, [recordedUrl, lastCachedUrl])

  if (!stream) {
    return (
      <div className="w-full max-w-2xl mx-auto rounded-xl overflow-hidden bg-gray-800/80 p-6 text-center">
        <p className="text-gray-500 text-sm">Waiting for camera to start recording…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto rounded-xl overflow-hidden bg-gray-800/80 border border-amber-500/50 p-6 text-center">
        <p className="text-amber-400 font-medium mb-1">Recording error</p>
        <p className="text-gray-400 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-center">
        {isRecording && (
          <span className="flex items-center gap-2 text-sm text-red-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            Recording…
          </span>
        )}
        {isRecording && (
          <button
            type="button"
            onClick={stopRecording}
            className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 font-medium text-sm sm:text-base transition-colors"
            aria-label="Finish recording"
          >
            Finish
          </button>
        )}
        {recordedUrl && !isRecording && (
          <>
            <button
              type="button"
              onClick={downloadVideo}
              className="px-5 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 font-medium text-sm sm:text-base transition-colors"
            >
              Download video
            </button>
            <a
              href={recordedUrl}
              download={recordedFilename || 'moon-light-room.webm'}
              className="inline-flex items-center px-5 py-2.5 rounded-lg bg-rose-600/90 hover:bg-rose-500 font-medium text-sm sm:text-base transition-colors"
            >
              Save reaction video (WebM)
            </a>
          </>
        )}
      </div>
      {recordedUrl && !isRecording && (
        <div className="rounded-xl overflow-hidden bg-black ring-1 ring-white/10 vignette relative">
          <p className="text-center text-white/60 text-sm py-2">Reaction video (WebM)</p>
          <video
            src={recordedUrl}
            controls
            className="w-full aspect-video object-contain"
            aria-label="Recorded video preview"
          />
        </div>
      )}

      {lastCachedUrl && !recordedUrl && !isRecording && (
        <div className="rounded-xl overflow-hidden bg-black/60 ring-1 ring-white/10 p-4 text-center">
          <p className="text-white/60 text-sm mb-2">Last video (saved for retakes)</p>
          <button
            type="button"
            onClick={downloadCachedVideo}
            className="px-4 py-2 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-sm font-medium"
          >
            Download last video
          </button>
        </div>
      )}
    </div>
  )
}

export default VideoRecorder
