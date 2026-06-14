import { Link } from 'react-router-dom'
import Logo from '@/components/brand/Logo'

function GithubGlyph({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.12-.31-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.18.77.84 1.24 1.92 1.24 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-content flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-body-sm text-text-3">
            Shape the sound of how you feel. Premium playlists from a prompt or a panel of
            controls — saved straight to Spotify.
          </p>
        </div>

        <nav className="flex gap-12">
          <div className="flex flex-col gap-3">
            <span className="text-overline uppercase text-text-3">Product</span>
            <Link to="/" className="text-body-sm text-text-2 transition-colors hover:text-text-1">
              Home
            </Link>
            <Link to="/connect" className="text-body-sm text-text-2 transition-colors hover:text-text-1">
              Connect
            </Link>
            <Link to="/about" className="text-body-sm text-text-2 transition-colors hover:text-text-1">
              About
            </Link>
          </div>
        </nav>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-3 px-4 py-5 text-caption text-text-3 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Sound Sculptor. Not affiliated with Spotify.</p>
          <a
            href="https://github.com/Dakuaisu"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 transition-colors hover:text-text-1"
          >
            <GithubGlyph className="h-4 w-4" /> GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}
