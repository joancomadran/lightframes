import { StrictMode } from 'react'
import { Analytics } from '@vercel/analytics/react'
import App from './App'
import './index.css'

// iOS Safari only hands touches to the page where it sees a listener, and React listens on the
// island root, which has no box (display: contents): taps and drags on the photo never arrived.
window.addEventListener('pointerdown', () => {}, { passive: true })

/** The editor island mounted by src/pages/editor.astro. */
export default function EditorRoot() {
  return (
    <StrictMode>
      <App />
      <Analytics />
    </StrictMode>
  )
}
