'use client'

/**
 * PRESA DELLE VIDEOCHIAMATE — demo, pronta per un servizio video.
 *
 * Gli scambi "online" (lingue, ripetizioni, informatica…) si fanno in videochiamata.
 * Oggi `startCall(person)` apre una chiamata finta: l'altra persona è il suo avatar e,
 * se l'utente lo permette, si vede l'anteprima della propria fotocamera (resta nel browser).
 *
 * Per collegare un servizio vero (Daily, Jitsi, LiveKit, Twilio Video, WebRTC proprio)
 * si sostituisce `CallUi` con un componente che:
 *   1. chiede al server un token per la stanza dello scambio (es. POST /api/rooms { exchangeId });
 *   2. entra nella stanza con l'SDK del servizio e mostra i flussi audio/video;
 *   3. chiama `onEnd()` quando la chiamata finisce.
 */
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react'

export interface CallPeer {
  id: string
  name: string
}

export interface CallUiProps {
  peer: CallPeer
  onEnd(): void
}

export interface VideoApi {
  startCall(peer: CallPeer): void
  inCall: boolean
}

const VideoContext = createContext<VideoApi | null>(null)

export function VideoProvider({ children, CallUi }: { children: ReactNode; CallUi: (p: CallUiProps) => ReactNode }) {
  const [peer, setPeer] = useState<CallPeer | null>(null)
  const startCall = useCallback((p: CallPeer) => setPeer(p), [])
  const api = useMemo(() => ({ startCall, inCall: !!peer }), [startCall, peer])
  return (
    <VideoContext.Provider value={api}>
      {children}
      {peer && <CallUi peer={peer} onEnd={() => setPeer(null)} />}
    </VideoContext.Provider>
  )
}

export function useVideo(): VideoApi {
  const ctx = useContext(VideoContext)
  if (!ctx) throw new Error('useVideo va usato dentro VideoProvider')
  return ctx
}

/** Accende la fotocamera locale per l'anteprima; null se non disponibile o negata. */
export async function openLocalCamera(): Promise<MediaStream | null> {
  try {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return null
    return await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
  } catch {
    return null
  }
}

export function stopStream(s: MediaStream | null) {
  s?.getTracks().forEach((t) => t.stop())
}
