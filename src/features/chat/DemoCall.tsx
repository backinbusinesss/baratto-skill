'use client'

import { Camera, CameraOff, Mic, MicOff, PhoneOff } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { type CallUiProps, openLocalCamera, stopStream } from '@/providers/video'
import { useT } from '@/store/hooks'
import { Avatar } from '@/ui/Avatar'

/** La videochiamata DEMO: l'altra persona è il suo avatar, la fotocamera è solo un'anteprima locale. */
export function DemoCall({ peer, onEnd }: CallUiProps) {
  const tr = useT()
  const video = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [noCam, setNoCam] = useState(false)
  const [muted, setMuted] = useState(false)
  const [secs, setSecs] = useState(-2)

  useEffect(() => {
    const id = setInterval(() => setSecs((s) => s + 1), 1000)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onEnd()
    document.addEventListener('keydown', onKey)
    return () => {
      clearInterval(id)
      document.removeEventListener('keydown', onKey)
    }
  }, [onEnd])
  useEffect(() => () => stopStream(stream), [stream])
  useEffect(() => {
    if (video.current) video.current.srcObject = stream
  }, [stream])

  const toggleCam = async () => {
    if (stream) {
      stopStream(stream)
      setStream(null)
      return
    }
    const s = await openLocalCamera()
    setNoCam(!s)
    setStream(s)
  }

  const time = `${Math.floor(Math.max(0, secs) / 60)}:${String(Math.max(0, secs) % 60).padStart(2, '0')}`

  return (
    <div role="dialog" aria-modal="true" aria-label={tr.t('video.title', { name: peer.name })} className="fixed inset-0 z-[70] flex flex-col bg-[#0b0f22] text-white">
      <div className="flex items-center justify-between px-5 pt-5">
        <div>
          <p className="font-bold">{tr.t('video.title', { name: peer.name })}</p>
          <p className="text-sm text-white/60">{secs < 0 ? tr.t('video.connecting') : tr.t('video.connected', { time })}</p>
        </div>
        <span className="rounded-full bg-yellow px-2.5 py-1 text-xs font-bold text-[#10162f]">{tr.t('common.demo')}</span>
      </div>
      <div className="relative flex flex-1 items-center justify-center">
        <motion.div animate={secs < 0 ? { scale: [1, 1.06, 1] } : { scale: 1 }} transition={{ repeat: secs < 0 ? Infinity : 0, duration: 1.4 }}>
          <Avatar seed={peer.id} name={peer.name} size={150} />
        </motion.div>
        <div className="absolute bottom-4 right-4 h-40 w-28 overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/20 sm:h-48 sm:w-36">
          {stream ? (
            <video ref={video} autoPlay muted playsInline className="h-full w-full scale-x-[-1] object-cover" />
          ) : (
            <div className="grid h-full place-items-center p-2 text-center text-xs text-white/60">{noCam ? tr.t('video.noCamera') : tr.t('common.you')}</div>
          )}
        </div>
      </div>
      <p className="px-5 text-center text-xs text-white/50">{tr.t('video.demo')}</p>
      <div className="safe-bottom flex items-center justify-center gap-4 px-5 pb-6 pt-4">
        <button className="btn btn-icon !h-14 !w-14 bg-white/10 text-white" onClick={() => setMuted(!muted)} aria-label={muted ? tr.t('video.unmute') : tr.t('video.mute')}>
          {muted ? <MicOff /> : <Mic />}
        </button>
        <button className="btn btn-icon !h-14 !w-14 bg-white/10 text-white" onClick={toggleCam} aria-label={stream ? tr.t('video.cameraOff') : tr.t('video.camera')}>
          {stream ? <CameraOff /> : <Camera />}
        </button>
        <button className="btn btn-icon !h-14 !w-14 bg-coral text-white" onClick={onEnd} aria-label={tr.t('video.end')}>
          <PhoneOff />
        </button>
      </div>
    </div>
  )
}
