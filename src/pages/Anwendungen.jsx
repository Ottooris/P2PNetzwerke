import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useReveal from '../hooks/useReveal';
import { useLang } from '../context/LangContext';
import t from '../i18n/translations';
import '../styles/Anwendungen.css';

/* ─── Icon Components ───────────────────────────────────────────── */

/**
 * Gibt ein thematisches SVG-Icon für eine P2P-Anwendung zurück.
 * Jedes Icon ist farblich auf die jeweilige App abgestimmt und
 * nutzt keine externen Ressourcen – alles ist inline gezeichnet.
 *
 * @param {{ id: string }} props - `id` entspricht dem App-Schlüssel
 *   (z.B. "bittorrent", "bitcoin", "webrtc", …)
 */
function AppIcon({ id }) {
  const icons = {
    // Dreieck mit Mittellinie und drei Knotenpunkten –
    // symbolisiert den BitTorrent-Pfeil (typisches Markenzeichen des Protokolls)
    bittorrent: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="30" stroke="#2997ff" strokeWidth="1.5" strokeOpacity="0.3" />
        <circle cx="32" cy="32" r="20" stroke="#2997ff" strokeWidth="1" strokeOpacity="0.2" />
        <path d="M32 8 L52 42 L12 42 Z" stroke="#2997ff" strokeWidth="1.5" fill="none" strokeOpacity="0.7" strokeLinejoin="round" />
        <line x1="32" y1="8" x2="32" y2="42" stroke="#2997ff" strokeWidth="1" strokeOpacity="0.4" />
        <circle cx="32" cy="42" r="3" fill="#2997ff" fillOpacity="0.8" />
        <circle cx="12" cy="42" r="2.5" fill="#2997ff" fillOpacity="0.5" />
        <circle cx="52" cy="42" r="2.5" fill="#2997ff" fillOpacity="0.5" />
      </svg>
    ),
    // Zwei horizontale Balken mit gebogenen Enden – stilisiertes „B" für Bitcoin;
    // der obere Bogen ist stärker betont als der untere (wie beim echten ₿-Symbol)
    bitcoin: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="30" stroke="#f7931a" strokeWidth="1.5" strokeOpacity="0.3" />
        <path d="M24 16 L24 48 M28 16 L28 48" stroke="#f7931a" strokeWidth="1.5" strokeOpacity="0.7" strokeLinecap="round" />
        <path d="M24 24 L36 24 C40 24 43 27 43 30 C43 33 40 36 36 36 L24 36" stroke="#f7931a" strokeWidth="1.5" strokeOpacity="0.7" fill="none" strokeLinejoin="round" />
        <path d="M24 36 L38 36 C42 36 45 39 45 42 C45 45 42 48 38 48 L24 48" stroke="#f7931a" strokeWidth="1.5" strokeOpacity="0.5" fill="none" strokeLinejoin="round" />
        <path d="M24 24 L38 24 C42 24 45 21 45 18 C45 15 42 16 38 16 L24 16" stroke="#f7931a" strokeWidth="1.5" strokeOpacity="0.3" fill="none" strokeLinejoin="round" />
      </svg>
    ),
    // Monitor mit zwei Kreisen (Peers) und gestrichelter Verbindungslinie –
    // veranschaulicht die direkte Browser-zu-Browser-Kommunikation von WebRTC
    webrtc: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="14" width="48" height="32" rx="4" stroke="#30d158" strokeWidth="1.5" strokeOpacity="0.5" />
        <line x1="32" y1="46" x2="32" y2="54" stroke="#30d158" strokeWidth="1.5" strokeOpacity="0.4" />
        <line x1="20" y1="54" x2="44" y2="54" stroke="#30d158" strokeWidth="1.5" strokeOpacity="0.4" />
        <circle cx="22" cy="30" r="7" stroke="#30d158" strokeWidth="1.2" strokeOpacity="0.7" />
        <circle cx="42" cy="30" r="7" stroke="#30d158" strokeWidth="1.2" strokeOpacity="0.7" />
        <path d="M29 30 L35 30" stroke="#30d158" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="2 1" />
        <circle cx="22" cy="30" r="2.5" fill="#30d158" fillOpacity="0.7" />
        <circle cx="42" cy="30" r="2.5" fill="#30d158" fillOpacity="0.7" />
      </svg>
    ),
    // Äußeres Hexagon + inneres Hexagon + zentraler Punkt mit Speichen –
    // abstrahiert das IPFS-Merkle-DAG-Netz (verteilte, inhaltsadressierte Knoten)
    ipfs: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="32,6 56,20 56,44 32,58 8,44 8,20" stroke="#bf5af2" strokeWidth="1.5" strokeOpacity="0.5" fill="none" />
        <polygon points="32,18 44,25 44,39 32,46 20,39 20,25" stroke="#bf5af2" strokeWidth="1" strokeOpacity="0.4" fill="none" />
        <circle cx="32" cy="32" r="4" fill="#bf5af2" fillOpacity="0.8" />
        <line x1="32" y1="6" x2="32" y2="28" stroke="#bf5af2" strokeWidth="1" strokeOpacity="0.3" />
        <line x1="56" y1="20" x2="44" y2="27" stroke="#bf5af2" strokeWidth="1" strokeOpacity="0.3" />
        <line x1="56" y1="44" x2="44" y2="37" stroke="#bf5af2" strokeWidth="1" strokeOpacity="0.3" />
        <line x1="32" y1="58" x2="32" y2="36" stroke="#bf5af2" strokeWidth="1" strokeOpacity="0.3" />
        <line x1="8" y1="44" x2="20" y2="37" stroke="#bf5af2" strokeWidth="1" strokeOpacity="0.3" />
        <line x1="8" y1="20" x2="20" y2="27" stroke="#bf5af2" strokeWidth="1" strokeOpacity="0.3" />
      </svg>
    ),
    // Drei Kreise (Peers) die über Linien verbunden sind –
    // stilisiert Skypes zentralisierten Verbindungsaufbau zwischen Gesprächspartnern;
    // die gestrichelte Mittellinie deutet den vermittelten Signalweg an
    skype: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="24" stroke="#0078d4" strokeWidth="1.5" strokeOpacity="0.5" />
        <circle cx="20" cy="24" r="6" stroke="#0078d4" strokeWidth="1.2" strokeOpacity="0.7" fill="none" />
        <circle cx="44" cy="24" r="6" stroke="#0078d4" strokeWidth="1.2" strokeOpacity="0.7" fill="none" />
        <circle cx="32" cy="42" r="6" stroke="#0078d4" strokeWidth="1.2" strokeOpacity="0.7" fill="none" />
        <line x1="26" y1="24" x2="38" y2="24" stroke="#0078d4" strokeWidth="1" strokeOpacity="0.5" />
        <line x1="22" y1="29" x2="30" y2="37" stroke="#0078d4" strokeWidth="1" strokeOpacity="0.5" />
        <line x1="42" y1="29" x2="34" y2="37" stroke="#0078d4" strokeWidth="1" strokeOpacity="0.5" />
        <line x1="32" y1="24" x2="32" y2="36" stroke="#0078d4" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="2 2" />
      </svg>
    ),
    // Sechs Knoten im Hexagonmuster, dicht quervernetzt –
    // zeigt Gnutellas dezentrales Floodnetz, in dem jeder Peer
    // direkte Verbindungen zu mehreren anderen Peers unterhält
    gnutella: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Sechs Knotenpunkte gleichmäßig auf einem Hexagon verteilt */}
        {[
          [32, 10], [54, 22], [54, 42], [32, 54], [10, 42], [10, 22]
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="4.5" stroke="#ff9f0a" strokeWidth="1.2" strokeOpacity="0.7" fill="rgba(255,159,10,0.1)" />
        ))}
        {/* Verbindungslinien: Außenring + diagonale Cross-Verbindungen
            simulieren das Mesh-Routing, bei dem Suchanfragen geflutet werden */}
        {[
          [32, 10, 54, 22], [54, 22, 54, 42], [54, 42, 32, 54],
          [32, 54, 10, 42], [10, 42, 10, 22], [10, 22, 32, 10],
          [32, 10, 54, 42], [54, 22, 10, 42], [32, 10, 10, 42],
          [10, 22, 54, 42], [32, 10, 32, 54],
        ].map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ff9f0a" strokeWidth="0.8" strokeOpacity="0.25" />
        ))}
      </svg>
    ),
  };
  return <div className="app-icon">{icons[id]}</div>;
}

/* ─── Application Section ───────────────────────────────────────── */

/**
 * Rendert eine vollständige Inhaltssektion für eine einzelne P2P-Anwendung.
 *
 * Gerade/ungerade Indizes wechseln das Layout zwischen Text-links/Bild-rechts
 * (even) und Bild-links/Text-rechts (odd), damit die Seite abwechslungsreich
 * wirkt (alternating-layout-Pattern).
 *
 * Die CSS Custom Property `--app-color` wird inline gesetzt und steuert
 * sämtliche farbigen Akzente (Glow, Badges, Titelfarbe) innerhalb der
 * Sektion – so reicht eine einzige Variable statt mehrerer farbspezifischer
 * Klassen.
 *
 * @param {{ app: object, index: number }} props
 *   - `app`   – App-Datensatz aus den Übersetzungen (name, year, description, …)
 *   - `index` – Position in der Gesamtliste, bestimmt gerade/ungerade Layout
 */
function AppSection({ app, index }) {
  // useReveal liefert eine ref; sobald das Element in den Viewport scrollt,
  // setzt der Hook data-reveal-Animationen auf die Kindknoten in Gang
  const ref = useReveal();

  // Bestimmt, ob Text links (even) oder rechts (odd) erscheint
  const isEven = index % 2 === 0;

  // Jede App hat eine individuelle Akzentfarbe, die dem Designsystem entspricht
  // (Apple-inspirierte Systemfarben: Blau, Orange, Grün, Lila, …)
  const accentColors = {
    bittorrent: '#2997ff',
    bitcoin: '#f7931a',
    webrtc: '#30d158',
    ipfs: '#bf5af2',
    skype: '#0078d4',
    gnutella: '#ff9f0a',
  };

  // Schlägt die Farbe für diese konkrete App nach
  const color = accentColors[app.id];

  return (
    // --app-color wird als inline Style übergeben, damit alle CSS-Regeln
    // innerhalb dieser Sektion die richtige Akzentfarbe erben können
    <section
      className={`app-section ${isEven ? 'app-section--even' : 'app-section--odd'}`}
      style={{ '--app-color': color }}
      ref={ref}
    >
      <div className="app-section__inner">
        {/* Textblock: Jahr-Badge, Kategorie, Titel, Tagline, Beschreibung und Detail-Kacheln */}
        <div className={`app-section__text ${isEven ? '' : 'app-section__text--right'}`}>
          <div className="app-section__header">
            {/* Jahreszahl als farbige Pille – nutzt ebenfalls --app-color für den Rand */}
            <span className="app-year-badge" style={{ '--app-color': color }} data-reveal data-delay="0">
              {app.year}
            </span>
            <span className="app-category" data-reveal data-delay="0">{app.category}</span>
          </div>
          {/* Titel erhält die App-Farbe direkt als color-Wert für den Farbverlauf-Effekt im CSS */}
          <h2 className="app-section__title" data-reveal data-delay="1" style={{ '--app-color': color }}>
            {app.name}
          </h2>
          <p className="app-section__tagline" data-reveal data-delay="2">{app.tagline}</p>
          <p className="app-section__desc" data-reveal data-delay="3">{app.description}</p>

          {/* Detail-Kacheln: technische Fakten (Protokoll, Besonderheiten, Relevanz etc.) */}
          <div className="app-details" data-reveal data-delay="4">
            {app.details.map((d, i) => (
              <div key={i} className="app-detail-item">
                {/* Titel der Kachel in der App-Farbe, damit die Zugehörigkeit sichtbar bleibt */}
                <h4 className="app-detail-title" style={{ color }}>{d.titel}</h4>
                <p className="app-detail-text">{d.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Visueller Block: SVG-Icon-Karte mit animiertem Glow-Effekt und Kennzahl */}
        <div className={`app-section__visual ${isEven ? '' : 'app-section__visual--left'}`} data-reveal data-delay="2">
          {/* Die Karte erbt --app-color für Rahmen, Glow und Metric-Wert-Färbung */}
          <div className="app-visual-card" style={{ '--app-color': color }}>
            <AppIcon id={app.id} />
            {/* Kennzahl (z.B. Nutzerzahl, Marktanteil) – Wert farbig, Label neutral */}
            <div className="app-metric">
              <span className="app-metric-value" style={{ '--app-color': color }}>
                {app.metric}
              </span>
              <span className="app-metric-label">{app.metricLabel}</span>
            </div>
            {/* Dekorativer Glow-Kreis hinter der Karte; aria-hidden damit Screenreader ihn überspringen */}
            <div className="app-visual-glow" style={{ '--app-color': color }} aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Page ──────────────────────────────────────────────────────── */

/**
 * Hauptseite "Anwendungen" – listet historische P2P-Anwendungen
 * in chronologischer Reihenfolge auf.
 *
 * Aufbau:
 *  1. Hero-Bereich mit animiertem Hintergrund
 *  2. Horizontale Timeline-Leiste als schnelle Übersicht
 *  3. Abwechselnde AppSection-Blöcke (eine pro App)
 */
export default function Anwendungen() {
  // useReveal für den Hero-Bereich: startet Einblend-Animationen beim ersten Render
  const heroRef = useReveal();

  // useLang liefert den aktuellen Sprachcode ("de" | "en") aus dem globalen Context;
  // `lang` steuert, welcher Übersetzungsast aus `t` geladen wird
  const lang = useLang();

  // Kurzreferenz auf den "anwendungen"-Ast der aktiven Sprache, um langen
  // Pfad `t[lang].anwendungen.xyz` auf `a.xyz` zu verkürzen
  const a = t[lang].anwendungen;

  // Navbar bekommt die CSS-Klasse "scrolled", sobald 10 px gescrollt wurde –
  // dadurch wird z.B. ein Hintergrund-Blur oder eine Schatten-Transition ausgelöst
  useEffect(() => {
    const nav = document.querySelector('.navbar');
    const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 10);
    // { passive: true } verhindert, dass der Browser auf preventDefault wartet –
    // verbessert die Scroll-Performance spürbar
    window.addEventListener('scroll', onScroll, { passive: true });
    // Cleanup: Listener beim Verlassen der Seite entfernen, um Memory-Leaks zu vermeiden
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="anwendungen-page">
      <Navbar />

      {/* ── Hero: voller Viewport, animierter Hintergrund mit Orbs und Grid ── */}
      <section className="anwendungen-hero" ref={heroRef}>
        {/* Rein dekorativer Hintergrund: zwei farbige Orbs + feines Liniengitter;
            aria-hidden verhindert, dass Screenreader diese leeren Divs vorlesen */}
        <div className="anwendungen-hero__bg" aria-hidden="true">
          <div className="hero-orb hero-orb-a" />
          <div className="hero-orb hero-orb-b" />
          <div className="hero-grid-lines" />
        </div>

        {/* Textinhalt des Heroes: Eyebrow-Label, Haupttitel, zwei Untertitelzeilen */}
        <div className="anwendungen-hero__content">
          <p className="hero-eyebrow" data-reveal data-delay="0">{a.hero.eyebrow}</p>
          <h1 className="hero-title" data-reveal data-delay="1">{a.hero.title}</h1>
          <p className="hero-sub" data-reveal data-delay="2">
            {a.hero.sub}<br className="br-desk" />{/* Zeilenumbruch nur auf Desktop sichtbar */}
            {a.hero.sub2}
          </p>
        </div>

        {/* Animierter Scroll-Hinweis (springender Punkt) – nur visuell, kein Interaktionselement */}
        <div className="hero-scroll-indicator" aria-hidden="true">
          <div className="scroll-dot" />
        </div>
      </section>

      {/* ── Timeline-Leiste: horizontale Übersicht aller Apps mit Jahr und Name ── */}
      {/* Jedes Item setzt --app-color inline, damit Punkt und Jahreszahl
          in der zur App gehörenden Akzentfarbe erscheinen */}
      <section className="timeline-section">
        <div className="timeline-inner">
          {a.apps.map((app, i) => {
            // Lokale Farb-Lookup-Tabelle – identisch zur AppSection, aber hier
            // nur für die schlanke Timeline-Darstellung benötigt
            const colors = {
              bittorrent: '#2997ff', bitcoin: '#f7931a', webrtc: '#30d158',
              ipfs: '#bf5af2', skype: '#0078d4', gnutella: '#ff9f0a',
            };
            return (
              <div key={app.id} className="timeline-item" style={{ '--app-color': colors[app.id] }}>
                <span className="timeline-year">{app.year}</span>
                {/* Farbiger Punkt auf der Zeitachse, gestylt per --app-color im CSS */}
                <div className="timeline-dot" />
                <span className="timeline-name">{app.name}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Haupt-Inhalt: eine AppSection pro Anwendung, abwechselndes Layout ── */}
      <main className="anwendungen-main">
        {a.apps.map((app, i) => (
          // `index={i}` bestimmt inside AppSection, ob Text links oder rechts liegt
          <AppSection key={app.id} app={app} index={i} />
        ))}
      </main>

      <Footer />
    </div>
  );
}
