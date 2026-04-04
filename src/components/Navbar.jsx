import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import t from '../i18n/translations';
import '../styles/Navbar.css';

const LANG_LABELS = { de: 'DE', it: 'IT', en: 'EN' };
const LANG_NAMES  = { de: 'Deutsch', it: 'Italiano', en: 'English' };

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const lang     = useLang();
  const nav      = t[lang].nav;
  const location = useLocation();
  const navigate = useNavigate();

  /* strip /:lang prefix to get the bare path, e.g. "/funktionsweise" */
  const barePath = location.pathname.replace(/^\/(de|it|en)/, '') || '/';

  function switchLang(newLang) {
    setMenuOpen(false);
    const dest = barePath === '/' ? `/${newLang}` : `/${newLang}${barePath}`;
    navigate(dest);
  }

  function isActive(path) {
    if (path === '/') return barePath === '/';
    return barePath === path || barePath.startsWith(path + '/');
  }

  const navLinks = [
    { label: nav.start,         path: '/'               },
    { label: nav.funktionsweise,path: '/funktionsweise' },
    { label: nav.anwendungen,   path: '/anwendungen'    },
    { label: nav.vorNachteile,  path: '/vor-nachteile'  },
    { label: nav.geschichte,    path: '/geschichte'     },
    { label: nav.simulator,     path: '/simulator'      },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={`/${lang}`} className="navbar-logo" onClick={() => setMenuOpen(false)}>
          P2P<span>Netzwerke</span>
        </Link>

        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
            <li key={link.path}>
              <Link
                to={`/${lang}${link.path === '/' ? '' : link.path}`}
                className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}

          {/* Language switcher — inside mobile menu */}
          <li className="nav-lang-mobile">
            {Object.keys(LANG_LABELS).map(l => (
              <button
                key={l}
                className={`lang-mobile-btn ${l === lang ? 'active' : ''}`}
                onClick={() => switchLang(l)}
              >
                {LANG_NAMES[l]}
              </button>
            ))}
          </li>
        </ul>

        {/* Language dropdown — desktop */}
        <div className="lang-switcher">
          <button className="lang-current">
            {LANG_LABELS[lang]}
            <svg className="lang-chevron" viewBox="0 0 10 6" width="10" height="6">
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </button>
          <div className="lang-dropdown">
            <div className="lang-dropdown-inner">
              {Object.keys(LANG_LABELS).map(l => (
                <button
                  key={l}
                  className={`lang-option ${l === lang ? 'active' : ''}`}
                  onClick={() => switchLang(l)}
                >
                  <span className="lang-code">{LANG_LABELS[l]}</span>
                  <span className="lang-name">{LANG_NAMES[l]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Menü"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
