import { Check, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '../../utils/cn'

export function CopyButton({ value, label = 'Copy', className }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(t)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      // Clipboard may be unavailable (insecure context); fail silently.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Copied' : label}
      title={copied ? 'Copied' : label}
      className={cn(
        'inline-flex size-7 items-center justify-center rounded-md text-subtle transition-colors hover:bg-surface-3 hover:text-fg',
        className,
      )}
    >
      {copied ? <Check className="size-3.5 text-success" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
    </button>
  )
}
