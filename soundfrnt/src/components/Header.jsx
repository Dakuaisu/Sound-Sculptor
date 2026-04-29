import { Link, useLocation } from 'react-router-dom'
import Logo from './Logo'

export default function Header() {
  const location = useLocation()

  const links = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/connect', label: 'Connect' },
  ]

  return (
    <>
      <div className="floatingheader">
        <header>
          <nav>
            <ul>
              <li>
                <Link to="/" className="name">
                  <Logo variant="header" />
                  Sound Sculptor
                </Link>
              </li>
              {links.map(({ to, label }) => (
                <li key={to} className="btm">
                  <Link
                    to={to}
                    className={location.pathname === to ? 'active' : ''}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>
      </div>
      <div className="placeholderheader">
        <header>
          <nav>
            <ul>
              <li className="name">Sound Sculptor</li>
            </ul>
          </nav>
        </header>
      </div>
    </>
  )
}
