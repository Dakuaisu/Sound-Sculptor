import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Logo from '@/components/brand/Logo'
import Button from '@/components/ui/Button'
import useStore from '@/stores/useStore'
import { cn } from '@/lib/cn'

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
]

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useStore()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [location.pathname])

  const avatarUrl = user?.images?.[0]?.url

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-colors duration-320',
        scrolled ? 'glass border-b border-line' : 'border-b border-transparent'
      )}
    >
      <div className="mx-auto flex h-header max-w-content items-center justify-between px-4 sm:px-6">
        <Link to="/" aria-label="Sound Sculptor home" className="rounded-md">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map(({ to, label }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'relative rounded-md px-3 py-2 text-body-sm font-medium transition-colors',
                  active ? 'text-text-1' : 'text-text-3 hover:text-text-1'
                )}
              >
                {label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-3 -bottom-px h-px bg-primary-500"
                  />
                )}
              </Link>
            )
          })}

          <div className="ml-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 rounded-pill border border-line bg-surface-2 py-1 pl-1 pr-3">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-grad-primary text-caption font-bold text-white">
                    {(user?.display_name || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="max-w-[10ch] truncate text-body-sm text-text-2">
                  {user?.display_name || 'Connected'}
                </span>
              </div>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => navigate('/connect')}>
                Connect Spotify
              </Button>
            )}
          </div>
        </nav>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-md text-text-2 hover:bg-white/5 md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-line glass md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {NAV.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="rounded-md px-3 py-2.5 text-body font-medium text-text-2 hover:bg-white/5 hover:text-text-1"
                >
                  {label}
                </Link>
              ))}
              {!isAuthenticated && (
                <Button className="mt-2" onClick={() => navigate('/connect')}>
                  Connect Spotify
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
