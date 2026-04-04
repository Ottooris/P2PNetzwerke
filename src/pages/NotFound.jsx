import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useLang } from '../context/LangContext';
import t from '../i18n/translations';
import '../styles/NotFound.css';

/* Dekoratives Mini-Netzwerk im Hintergrund */
const NODES = [
  { x: 15, y: 20 }, { x: 82, y: 12 }, { x: 55, y: 38 },
  { x: 28, y: 60 }, { x: 70, y: 65 }, { x: 90, y: 40 },
  { x: 10, y: 80 }, { x: 48, y: 82 }, { x: 78, y: 88 },
];
const EDGES = [
  [0, 2], [1, 2], [1, 5], [2, 3], [2, 4], [2, 5],
  [3, 6], [4, 7], [5, 8], [6, 7], [7, 8],
];

export default function NotFound() {
  /* Aktive Sprache aus dem Kontext */
  const lang = useLang();
  /* Übersetzungen für die 404-Seite */
  const tx = t[lang].notFound;

  return (
    <div className="nf-page">
      <Navbar />

      {/* Hintergrund-Netzwerk (nur dekorativ) */}
      <div className="nf-net-bg" aria-hidden="true">
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="nf-net-svg">
          {EDGES.map(([a, b]) => (
            <line
              key={`${a}-${b}`}
              x1={NODES[a].x} y1={NODES[a].y}
              x2={NODES[b].x} y2={NODES[b].y}
              className="nf-net-edge"
            />
          ))}
          {NODES.map((n, i) => (
            <circle key={i} cx={n.x} cy={n.y} r="1.2" className="nf-net-node" />
          ))}
        </svg>
      </div>

      {/* Hintergrund-Orbs (dekorativ) */}
      <div className="nf-orbs" aria-hidden="true">
        <div className="nf-orb nf-orb-1" />
        <div className="nf-orb nf-orb-2" />
        <div className="nf-orb nf-orb-3" />
      </div>

      <main className="nf-main">
        {/* Fehler-Label */}
        <p className="nf-eyebrow">{tx.eyebrow}</p>

        {/* Animierte 404-Anzeige */}
        <div className="nf-code-wrap" aria-hidden="true">
          <span className="nf-digit">4</span>
          <div className="nf-zero-wrap">
            <svg viewBox="0 0 80 80" className="nf-zero-svg">
              <defs>
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   stopColor="#f5f5f7" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              {/* Gebrochener Ring */}
              <circle cx="40" cy="40" r="28" className="nf-zero-ring" />
              {/* Toter Knoten in der Mitte */}
              <circle cx="40" cy="40" r="6" className="nf-zero-dot" />
              <line x1="36" y1="36" x2="44" y2="44" className="nf-zero-x" />
              <line x1="44" y1="36" x2="36" y2="44" className="nf-zero-x" />
            </svg>
          </div>
          <span className="nf-digit">4</span>
        </div>

        {/* Übersetzter Titel und Beschreibung */}
        <h1 className="nf-title">{tx.title}</h1>
        <p className="nf-sub">
          {tx.sub1}<br className="br-desk" />
          {tx.sub2}
        </p>

        {/* Aktionsbuttons */}
        <div className="nf-actions">
          <Link to={`/${lang}`} className="nf-btn-primary">{tx.backBtn}</Link>
          <Link to={`/${lang}/simulator`} className="nf-btn-ghost">{tx.simBtn}</Link>
        </div>

        {/* Statuszeile */}
        <div className="nf-status-row">
          <span className="nf-status-dot" />
          <span className="nf-status-text">{tx.statusText}</span>
        </div>
      </main>
    </div>
  );
}
