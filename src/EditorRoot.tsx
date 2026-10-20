import { StrictMode } from 'react'
import { Analytics } from '@vercel/analytics/react'
import App from './App'
import './index.css'

/** The editor island mounted by src/pages/editor.astro. */
export default function EditorRoot() {
  return (
    <StrictMode>
      <App />
      <Analytics />
    </StrictMode>
  )
}
