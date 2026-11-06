import { useEffect } from 'react'
import { useSettings } from './useSettings'

/** Mirrors the theme preference onto <html data-theme>, which drives the CSS tokens. */
export function useApplyTheme(): void {
  const { settings } = useSettings()
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
  }, [settings.theme])
}
