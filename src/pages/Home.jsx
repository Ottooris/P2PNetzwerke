// Importiert React-Hooks für Seiteneffekte und DOM-Referenzen
import { useEffect, useRef } from 'react';
// Layout-Komponenten für Navigation und Fußzeile
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
// Eigener Hook: blendet Elemente mit data-reveal-Attribut beim Scrollen ein
import useReveal from '../hooks/useReveal';
// Eigener Hook: animiert eine Zahl von 0 bis zum Zielwert, sobald sie sichtbar wird
import useCounter from '../hooks/useCounter';
// Sprachkontext: liefert die aktuell gewählte Sprache ('de' oder 'en')
import { useLang } from '../context/LangContext';
// Übersetzungs-Objekt mit allen Texten nach Sprache gegliedert
import t from '../i18n/translations';
// Seitenspezifisches Stylesheet für die Home-Seite
import '../styles/Home.css';

/**
 * NetworkDiagram – Animiertes SVG-Netzwerkdiagramm, das ein Peer-to-Peer-Netz visualisiert.
 *
 * @param {string} center    – Hauptbeschriftung des zentralen Knotens
 * @param {string} centerSub – Unterbeschriftung des zentralen Knotens
 * @param {string} caption   – Bildunterschrift unterhalb des SVG
 *
 * Das Diagramm zeichnet sich per CSS-Animation, sobald es mindestens zu 30 %
 * im Viewport sichtbar ist (IntersectionObserver fügt die Klasse „draw" hinzu).
 */
function NetworkDiagram({ center, centerSub, caption }) {
  // Referenz auf das SVG-Element, um den IntersectionObserver daran zu hängen
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // IntersectionObserver beobachtet, ob das SVG sichtbar wird
    const obs = new IntersectionObserver(([e]) => {
      // Sobald 30 % des SVG sichtbar sind, wird die CSS-Klasse „draw" gesetzt,
      // die die Zeichenanimation der Linien und Knoten auslöst
      if (e.isIntersecting) { svg.classList.add('draw'); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(svg);

    // Aufräumen: Observer beim Unmount entfernen
    return () => obs.disconnect();
  }, []);

  // Koordinaten der sieben Peer-Knoten, die kreisförmig um das Zentrum angeordnet sind
  const peers = [
    { cx: 80,  cy: 80  }, { cx: 240, cy: 40  }, { cx: 400, cy: 80  },
    { cx: 440, cy: 200 }, { cx: 360, cy: 290 }, { cx: 120, cy: 290 },
    { cx: 40,  cy: 200 },
  ];

  // Indexpaare für Querverbindungen zwischen einzelnen Peers (veranschaulicht
  // das dezentrale Netz ohne zentralen Vermittler)
  const cross = [[0,2],[3,6],[4,5],[0,5],[2,3]];

  return (
    <>
      {/* Haupt-SVG mit viewBox 480×320 – skaliert sich responsiv */}
      <svg ref={svgRef} viewBox="0 0 480 320" fill="none" className="diagram-svg">

        {/* Gestrichelte Querverbindungen zwischen Peers (dezentrale Verbindungen) */}
        {cross.map(([a, b], i) => (
          <line key={`cross-${i}`}
            x1={peers[a].cx} y1={peers[a].cy} x2={peers[b].cx} y2={peers[b].cy}
            stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 6"
            className="svg-line-cross"
          />
        ))}

        {/* Verbindungslinien vom Zentrum zu jedem Peer-Knoten;
            jede Linie startet mit animationDelay, damit sie nacheinander erscheinen */}
        {peers.map((n, i) => (
          <line key={`line-${i}`}
            x1="240" y1="160" x2={n.cx} y2={n.cy}
            stroke="#2997ff" strokeWidth="1" strokeOpacity="0.35"
            // strokeDasharray/Offset erzeugt den „Zeichnen"-Effekt per CSS-Animation
            strokeDasharray="200" strokeDashoffset="200"
            className="svg-line" style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}

        {/* Peer-Knoten als Kreise mit Beschriftung; erscheinen verzögert nach den Linien */}
        {peers.map((n, i) => (
          <g key={`peer-${i}`} className="svg-peer" style={{ animationDelay: `${0.7 + i * 0.08}s` }}>
            <circle cx={n.cx} cy={n.cy} r="18" fill="#1d1d1f" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <text x={n.cx} y={n.cy + 4} textAnchor="middle" fill="#86868b" fontSize="7"
              fontFamily="-apple-system,sans-serif" fontWeight="500">
              Peer {i + 1}
            </text>
          </g>
        ))}

        {/* Zentraler Knoten mit Pulsierungsring – repräsentiert das P2P-Netzwerk als Ganzes */}
        <g className="svg-center">
          <circle cx="240" cy="160" r="36" fill="#0a1929" stroke="#2997ff" strokeWidth="1.5" strokeOpacity="0.8" />
          {/* Äußerer, pulsierender Leuchtring um den zentralen Knoten */}
          <circle cx="240" cy="160" r="42" fill="none" stroke="#2997ff" strokeWidth="1" strokeOpacity="0.2" className="svg-pulse-ring" />
          <text x="240" y="156" textAnchor="middle" fill="#2997ff" fontSize="8"
            fontFamily="-apple-system,sans-serif" fontWeight="600">{center}</text>
          <text x="240" y="169" textAnchor="middle" fill="#515154" fontSize="6.5"
            fontFamily="-apple-system,sans-serif">{centerSub}</text>
        </g>
      </svg>

      {/* Bildunterschrift unterhalb des Diagramms */}
      <p className="diagram-caption">{caption}</p>
    </>
  );
}

/**
 * Stat – Einzelne Statistik-Kachel mit animiertem Hochzähl-Effekt.
 *
 * @param {string|number} value  – Anzeigewert (z. B. "~500" oder "95")
 * @param {string}        label  – Beschriftung unterhalb der Zahl
 * @param {string}        suffix – Optionaler Zusatz hinter der Zahl (z. B. "%", "M+")
 */
function Stat({ value, label, suffix = '' }) {
  // Entfernt alle nicht-numerischen Zeichen außer dem Dezimalpunkt,
  // um den reinen Zahlenwert für den Counter-Hook zu erhalten
  const numeric = parseFloat(String(value).replace(/[^0-9.]/g, ''));

  // Erkennt das Tilde-Zeichen als „Circa"-Präfix und stellt es später wieder voran
  const prefix  = String(value).startsWith('~') ? '~' : '';

  // useCounter liefert eine DOM-Referenz (ref) für den IntersectionObserver
  // und die aktuell animierte Zahl (count); Dauer: 2000 ms
  const { ref, count } = useCounter(numeric, 2000);

  return (
    <div className="stat" ref={ref}>
      {/* Animierte Zahl mit optionalem Präfix und Suffix */}
      <span className="stat-num">{prefix}{count}{suffix}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

/**
 * Home – Hauptseite der Abschlusswebsite über Peer-to-Peer-Netzwerke.
 *
 * Enthält folgende Sektionen:
 *   Hero → Statement → Definition → Stats → Eigenschaften →
 *   Vergleich → Beispiele → Typen
 *
 * Alle inhaltlichen Texte kommen aus dem Übersetzungs-Objekt `t[lang].home`,
 * sodass die Seite vollständig mehrsprachig ist.
 */
export default function Home() {
  // Aktuelle Sprache aus dem globalen Kontext ('de' | 'en')
  const lang = useLang();

  // Kurzreferenz auf alle Home-Texte der gewählten Sprache
  const h    = t[lang].home;

  // useReveal-Refs: Jeder Ref wird an eine <section> gehängt.
  // Der Hook beobachtet per IntersectionObserver alle Kindelemente mit
  // data-reveal-Attribut und fügt ihnen beim Einblenden die CSS-Klasse
  // „revealed" hinzu, was die Einblend-Animation auslöst.
  const defRef   = useReveal(); // Definition-Sektion
  const statsRef = useReveal(); // Statistiken-Sektion
  const featRef  = useReveal(); // Eigenschaften-Sektion
  const tableRef = useReveal(); // Vergleichstabelle-Sektion
  const exRef    = useReveal(); // Beispiele-Sektion
  const typesRef = useReveal(); // Typen-Sektion

  useEffect(() => {
    const nav = document.querySelector('.navbar');

    // Beim Scrollen wird der Navbar die Klasse „scrolled" hinzugefügt,
    // sobald der Nutzer mehr als 10 px nach unten gescrollt hat –
    // das ermöglicht einen stilistischen Übergang (z. B. Hintergrundfarbe)
    const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });

    // Event-Listener beim Unmount entfernen, um Memory-Leaks zu vermeiden
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="home">
      <Navbar />

      {/* ── Hero – Einstiegsbereich mit Titel, Untertitel und Call-to-Action-Buttons ── */}
      <section className="hero">
        {/* Dekorativer Hintergrund: Gitterlinien, leuchtende Orbs und Partikel */}
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-grid-lines" />
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
          <div className="hero-orb hero-orb-4" />
          {/* 22 animierte Partikel-Punkte für den Tiefeneffekt im Hintergrund */}
          <div className="hero-particles">
            {[...Array(22)].map((_, i) => <div key={i} className={`hero-particle hero-particle-${i}`} />)}
          </div>
        </div>

        {/* Eigentlicher Textinhalt des Hero-Bereichs */}
        <div className="hero-content">
          {/* Kleine Eyebrow-Zeile über dem Haupttitel */}
          <p className="hero-eyebrow">{h.hero.eyebrow}</p>
          <h1 className="hero-title">
            {/* Erstes Wort in neutraler Farbe, zweites Wort farblich hervorgehoben */}
            <span className="hero-word">{h.hero.word1}</span>
            <span className="hero-word hero-accent-word">{h.hero.word2}</span>
          </h1>
          <p className="hero-sub">{h.hero.sub}</p>
          <div className="hero-actions">
            {/* Primärer Button springt direkt zur Definition-Sektion */}
            <a href="#definition" className="btn-blue">{h.hero.btn1}</a>
            {/* Sekundärer Text-Link springt zur Beispiele-Sektion */}
            <a href="#beispiele"  className="btn-text">{h.hero.btn2}</a>
          </div>
        </div>

        {/* Animierter Scroll-Indikator am unteren Hero-Rand */}
        <div className="hero-scroll-indicator" aria-hidden="true">
          <div className="scroll-dot" />
        </div>
      </section>

      {/* ── Statement – Kurzes, prägnantes Zitat oder Kernaussage zum Thema ── */}
      <section className="statement-section">
        <div className="wrap-narrow">
          {/* data-reveal löst die Einblend-Animation aus, sobald der Text sichtbar wird */}
          <p className="statement-text" data-reveal>
            {h.statement.text}<br />
            {/* Hervorgehobener Teilsatz innerhalb des Statements */}
            <span>{h.statement.span}</span>
          </p>
        </div>
      </section>

      {/* ── Definition – Erklärt, was Peer-to-Peer-Netzwerke sind, mit Netzwerkdiagramm ── */}
      <section id="definition" className="section bg-dark" ref={defRef}>
        <div className="wrap-narrow center-text">
          {/* data-delay steuert die gestaffelte Einblend-Reihenfolge der Elemente */}
          <p className="eyebrow" data-reveal data-delay="0">{h.definition.eyebrow}</p>
          <h2 data-reveal data-delay="1">{h.definition.heading}</h2>
          {/* Erster Absatz: Definition mit einem hervorgehobenen Begriff und kursivem Zusatz */}
          <p className="body-large" data-reveal data-delay="2">
            {h.definition.p1_pre}
            <strong>{h.definition.p1_strong}</strong>
            {h.definition.p1_mid}
            <em>{h.definition.p1_em}</em>
            {h.definition.p1_end}
          </p>
          {/* Zweiter Absatz: Abgrenzung zum Client-Server-Modell */}
          <p className="body-large" data-reveal data-delay="3">
            {h.definition.p2_pre}
            <strong>{h.definition.p2_s1}</strong>
            {h.definition.p2_mid}
            <strong>{h.definition.p2_s2}</strong>
            {h.definition.p2_end}
          </p>
        </div>

        {/* Animiertes SVG-Netzwerkdiagramm zur visuellen Veranschaulichung */}
        <div className="diagram-wrap" data-reveal data-delay="4">
          <NetworkDiagram
            center={h.definition.center}
            centerSub={h.definition.centerSub}
            caption={h.definition.caption}
          />
        </div>
      </section>

      {/* ── Stats – Kennzahlen und Fakten zu P2P-Netzwerken mit Hochzähl-Animation ── */}
      <section className="section bg-black stats-section" ref={statsRef}>
        <div className="wrap" data-reveal>
          <p className="eyebrow center-text" style={{ marginBottom: '3.5rem' }}>{h.stats.eyebrow}</p>
          <div className="stats-row">
            {/* Iteriert über alle Statistik-Einträge aus den Übersetzungen;
                zwischen je zwei Kacheln wird ein visueller Trenner eingefügt */}
            {h.stats.items.map((s, i) => (
              <>
                {/* Vertikaler Trenner – wird nicht vor der ersten Kachel gerendert */}
                {i > 0 && <div key={`div-${i}`} className="stat-divider" />}
                <Stat key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
              </>
            ))}
          </div>
        </div>
      </section>

      {/* ── Eigenschaften – Kernmerkmale von P2P-Netzwerken als nummeriertes Raster ── */}
      <section className="section bg-dark" ref={featRef}>
        <div className="wrap">
          <div className="feat-header">
            <p className="eyebrow" data-reveal data-delay="0">{h.features.eyebrow}</p>
            <h2 data-reveal data-delay="1">
              {/* Zweizeiliger Abschnittsheader */}
              {h.features.heading1}<br />{h.features.heading2}
            </h2>
          </div>
          <div className="feat-grid">
            {/* Jede Eigenschaft erhält eine zweistellige Nummerierung (01, 02, …) */}
            {h.features.items.map((e, i) => (
              <div key={i} className="feat-item" data-reveal data-delay={i}>
                <span className="feat-num">0{i + 1}</span>
                <h3>{e.titel}</h3>
                <p>{e.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vergleich – Gegenüberstellung von P2P und Client-Server als Tabelle ── */}
      <section className="section bg-black" ref={tableRef}>
        <div className="wrap-narrow">
          <div className="center-text" style={{ marginBottom: '3rem' }}>
            <p className="eyebrow" data-reveal data-delay="0">{h.comparison.eyebrow}</p>
            <h2 data-reveal data-delay="1">{h.comparison.heading}</h2>
          </div>
          <div data-reveal data-delay="2">
            <table className="table">
              <thead>
                <tr>
                  {/* Spaltenüberschriften; die P2P-Spalte erhält eine Sonderklasse für farbliche Hervorhebung */}
                  {h.comparison.headers.map(hd => (
                    <th key={hd} className={hd === h.comparison.headers[1] ? 'th-p2p' : ''}>{hd}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Jede Zeile vergleicht ein Merkmal (key) für P2P und Client-Server */}
                {h.comparison.rows.map(row => (
                  <tr key={row.key}>
                    <td className="td-key">{row.key}</td>
                    <td className="td-p2p">{row.p2p}</td>
                    <td className="td-cs">{row.cs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Beispiele – Bekannte P2P-Anwendungen als nummerierte Liste ── */}
      <section id="beispiele" className="section bg-dark" ref={exRef}>
        <div className="wrap">
          <div className="center-text" style={{ marginBottom: '3.5rem' }}>
            <p className="eyebrow" data-reveal data-delay="0">{h.examples.eyebrow}</p>
            <h2 data-reveal data-delay="1">{h.examples.heading}</h2>
            <p className="section-sub" data-reveal data-delay="2">{h.examples.sub}</p>
          </div>
          <div className="examples-list">
            {/* Jede Anwendung zeigt: zweistellige Nummer, Name, Kategorie und Gründungsjahr */}
            {h.examples.items.map((b, i) => (
              <div key={i} className="example-row" data-reveal data-delay={i}>
                {/* padStart(2, '0') erzeugt stets zweistellige Nummern: 01, 02, … */}
                <span className="ex-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="ex-name">{b.name}</span>
                <span className="ex-kat">{b.kat}</span>
                <span className="ex-jahr">{b.jahr}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Typen – Verschiedene P2P-Netzwerk-Architekturen als Kachelraster ── */}
      <section className="section bg-black" ref={typesRef}>
        <div className="wrap">
          <div className="center-text" style={{ marginBottom: '3.5rem' }}>
            <p className="eyebrow" data-reveal data-delay="0">{h.types.eyebrow}</p>
            <h2 data-reveal data-delay="1">{h.types.heading}</h2>
          </div>
          <div className="types-grid">
            {/* Kacheln mit Typnummer, Titel, Beschreibung und Beispiel-Anwendung;
                featured-Typen erhalten eine Sonderklasse und ein Badge */}
            {h.types.items.map((type, i) => (
              <div key={type.num}
                className={`type-block ${type.featured ? 'type-block-featured' : ''}`}
                data-reveal data-delay={i}
              >
                <p className="type-num">{type.num}</p>
                <h3>{type.titel}</h3>
                <p>{type.text}</p>
                {/* Konkretes Anwendungsbeispiel für diesen Netzwerk-Typ */}
                <p className="type-example">{type.bsp}</p>
                {/* Badge wird nur beim hervorgehobenen Typ angezeigt */}
                {type.featured && <span className="type-badge">{h.types.badge}</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
