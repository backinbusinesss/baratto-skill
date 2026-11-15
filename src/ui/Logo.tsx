/**
 * Il marchio: un volantino con due linguette, una strappata che "va" all'altra persona.
 * Disegnato in SVG, usa i colori del tema.
 */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden>
      <rect x="6" y="6" width="52" height="52" rx="14" fill="var(--cobalt)" />
      <path d="M17 18h30v18H17z" fill="#fff" />
      <path d="M17 36h30" stroke="var(--cobalt)" strokeWidth="2" strokeDasharray="3 2.5" />
      <path d="M17 36h9.5v12H17z" fill="#fff" />
      <path d="M37.5 36H47v12h-9.5z" fill="#fff" />
      <path d="M27.5 39.5h9l1 9.5h-9.5z" fill="#FFD43B" transform="rotate(-12 32 44)" />
      <path d="M22 25h14M22 30h9" stroke="var(--cobalt)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      <LogoMark size={30} />
      <span className="text-[1.15rem] font-extrabold leading-none tracking-tight" style={{ fontStretch: '78%' }}>
        Baratto<span className="text-cobalt">Skill</span>
      </span>
    </span>
  )
}
