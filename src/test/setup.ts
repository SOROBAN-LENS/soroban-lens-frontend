import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// jsdom has no scrolling; ScrollRestoration calls window.scrollTo.
window.scrollTo = () => {}

afterEach(() => {
  cleanup()
  try {
    localStorage.clear()
  } catch {
    // ignore
  }
})
