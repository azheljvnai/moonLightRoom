import { useCallback, useRef, useState } from 'react'

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

export function useRecording() {
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const [isRecording, setIsRecording] = useState(false)
  const [recordedUrl, setRecordedUrl] = useState(null)
  const [recordedFilename, setRecordedFilename] = useState(null)
  const [error, setError] = useState(null)

  const startRecording = useCallback((stream) => {
    if (!stream || stream.getVideoTracks().length === 0) return
    setError(null)
    setRecordedUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setRecordedFilename(null)
    chunksRef.current = []
    const mimeType = getPreferredMimeType()
    const options = mimeType
      ? { mimeType, videoBitsPerSecond: 2500000, audioBitsPerSecond: 128000 }
      : {}
    try {
      const recorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = recorder
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        if (chunksRef.current.length === 0) return
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'video/webm',
        })
        const url = URL.createObjectURL(blob)
        setRecordedUrl(url)
        setRecordedFilename(`moon-light-room-${Date.now()}.webm`)
        setError(null)
      }
      recorder.onerror = (e) => {
        setError(e.error?.message || 'Recording failed')
      }
      recorder.start(1000)
      setIsRecording(true)
    } catch (err) {
      setError(err.message || 'Failed to start recording')
    }
  }, [])

  const stopRecording = useCallback(() => {
    const rec = mediaRecorderRef.current
    if (rec && rec.state === 'recording') {
      rec.stop()
    }
    mediaRecorderRef.current = null
    setIsRecording(false)
  }, [])

  return {
    isRecording,
    recordedUrl,
    recordedFilename,
    error,
    startRecording,
    stopRecording,
  }
}
