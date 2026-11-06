import { cn } from '../../utils/cn'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={cn('size-7', className)}>
      <rect width="32" height="32" rx="8" className="fill-surface-3" />
      <circle cx="14" cy="14" r="7" stroke="currentColor" strokeWidth="2.5" className="text-accent" />
      <path d="M19.5 19.5 25 25" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-accent" />
      <path d="M11 14h2l1-3 2 6 1-3h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-fg" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-tight text-fg">
        Soroban<span className="text-accent">Lens</span>
      </span>
    </span>
  )
}
