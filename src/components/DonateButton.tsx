/** Buy Me a Coffee page. Swap the handle if the account uses a different one. */
const DONATE_URL = 'https://buymeacoffee.com/devcoma'

/** Pill link for one-off donations, styled to sit next to the GitHub star. `compact` fits the sidebar row. */
export function DonateButton({ compact = false }: { compact?: boolean }) {
  return (
    <a
      className="github-star donate"
      href={DONATE_URL}
      target="_blank"
      rel="noopener noreferrer"
      title="Lightframes is free — buy me a coffee to keep it that way"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
        <path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17" />
        <path d="M8 2.5v2.5M12 2.5v2.5" />
      </svg>
      {compact ? 'Donate' : 'Buy me a coffee'}
    </a>
  )
}
