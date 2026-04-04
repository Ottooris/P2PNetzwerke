/**
 * Funktionsweise.jsx
 *
 * Seite „Wie funktioniert P2P?" — erklärt die technischen Grundlagen
 * von Peer-to-Peer-Netzwerken in fünf inhaltlichen Abschnitten:
 *   1. Hero          – einleitende Überschrift mit animiertem Hintergrund
 *   2. Topologien    – visuelle Gegenüberstellung von Netzwerktopologien (SVG-Karten)
 *   3. Steps         – nummerierter Ablauf eines P2P-Verbindungsaufbaus
 *   4. DHT           – Erläuterung der Distributed Hash Table mit SVG-Diagramm
 *   5. NAT Traversal – Ablauf des NAT-Traversal-Prozesses als Karten-Reihe
 *
 * Sprache und Texte kommen aus dem zentralen Übersetzungs-Objekt (`t`),
 * der aktive Sprachcode wird per `useLang`-Hook aus dem LangContext bezogen.
 * Scroll-Animationen werden pro Sektion über `useReveal` gesteuert.
 */
import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useReveal from '../hooks/useReveal';
import { useLang } from '../context/LangContext';
import t from '../i18n/translations';
import '../styles/Funktionsweise.css';

/**
 * Funktionsweise
 *
 * Haupt-Komponente der gleichnamigen Route. Rendert alle fünf Inhaltssektionen
 * und verbindet sie mit ihren jeweiligen Scroll-Reveal-Referenzen.
 *
 * @returns {JSX.Element} Die vollständige Seite inkl. Navbar und Footer.
 */
export default function Funktionsweise() {
  // Aktuell gewählter Sprachcode ('de' oder 'en'), kommt aus dem globalen LangContext
  const lang = useLang();

  // Kurzreferenz auf den funktionsweise-Teilbaum der Übersetzungen für die aktive Sprache.
  // Alle f.hero.*, f.topo.*, f.steps.*, f.dht.*, f.nat.* Zugriffe weiter unten
  // greifen auf dieses Objekt zurück, um doppeltes t[lang].funktionsweise zu vermeiden.
  const f = t[lang].funktionsweise;

  // Ein eigener useReveal-Ref pro Sektion:
  // useReveal liefert eine React-Ref, die beim Eintreten in den Viewport
  // allen Kind-Elementen mit data-reveal die CSS-Klasse „revealed" hinzufügt.
  // data-delay="n" steuert dabei den gestaffelten Einblend-Zeitversatz (Stagger).
  const heroRef  = useReveal();
  const topoRef  = useReveal();
  const stepsRef = useReveal();
  const dhtRef   = useReveal();
  const natRef   = useReveal();

  /**
   * Navbar-Scroll-Effekt:
   * Sobald der Nutzer mehr als 10 px gescrollt hat, bekommt die Navbar
   * die Klasse „scrolled" (z. B. für einen transparenten → opaken Übergang).
   * Der passive Event-Listener vermeidet Blockierungen des Scroll-Threads.
   * Beim Unmount der Komponente wird der Listener wieder entfernt.
   */
  useEffect(() => {
    const nav = document.querySelector('.navbar');
    const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fw-page">
      <Navbar />

      {/* ── Hero ── Einleitungsbereich mit animiertem Hintergrund und zentralem Titel */}
      <section className="fw-hero" ref={heroRef}>
        {/* Dekorativer Hintergrund: zwei Lichtkreise (Orbs) + Gitternetz-Overlay.
            aria-hidden verhindert, dass Screenreader diese reinen Deko-Elemente vorlesen. */}
        <div className="fw-hero-bg" aria-hidden="true">
          <div className="fw-orb fw-orb-1" />
          <div className="fw-orb fw-orb-2" />
          <div className="fw-hero-grid" />
        </div>
        {/* Textinhalt des Hero: Eyebrow-Label, H1-Titel, zweizeiliger Untertitel.
            data-reveal und data-delay steuern die gestaffelte Einblend-Animation. */}
        <div className="fw-hero-content">
          <p className="fw-eyebrow" data-reveal data-delay="0">{f.hero.eyebrow}</p>
          <h1 className="fw-hero-title" data-reveal data-delay="1">{f.hero.title}</h1>
          <p className="fw-hero-sub" data-reveal data-delay="2">
            {/* br-desk ist eine CSS-gesteuerte Umbruchhilfe, die nur auf großen Bildschirmen sichtbar ist */}
            {f.hero.sub_pre}<br className="br-desk" />
            {f.hero.sub_end}
          </p>
        </div>
      </section>

      {/* ── Topologien ── Vergleich verschiedener Netzwerktopologien als SVG-Karten-Grid */}
      <section className="fw-section fw-section-dark" ref={topoRef}>
        <div className="fw-wrap">
          <p className="fw-eyebrow" data-reveal data-delay="0">{f.topo.eyebrow}</p>
          <h2 className="fw-section-title" data-reveal data-delay="1">{f.topo.heading}</h2>
          <p className="fw-section-sub" data-reveal data-delay="2">
            {f.topo.sub}
          </p>
          {/* Karten-Grid: jedes topo.items-Element wird als eigene Karte gerendert */}
          <div className="topo-grid" data-reveal data-delay="3">
            {f.topo.items.map((topo) => (
              /* Die hervorgehobene Topologie (f.topo.featured) erhält die Zusatzklasse topo-card-featured */
              <div key={topo.label} className={`topo-card ${topo.label === f.topo.featured ? 'topo-card-featured' : ''}`}>
                {/* SVG-Diagramm der jeweiligen Topologie:
                    - topo.lines enthält Koordinatenpaare [x1,y1,x2,y2] für Verbindungslinien zwischen Knoten
                    - topo.dots enthält Koordinatenpaare [cx,cy] für die Knoten-Kreise
                    - topo.center markiert den zentralen Knoten (falls vorhanden) — er bekommt
                      einen blauen Akzentfarben-Kreis mit größerem Radius (5 statt 4) */}
                <svg viewBox="0 0 100 100" className="topo-svg">
                  {topo.lines.map(([x1,y1,x2,y2], i) => (
                    <line key={i} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`}
                      stroke="rgba(41,151,255,0.35)" strokeWidth="1.2" />
                  ))}
                  {topo.dots.map(([cx,cy], i) => (
                    <circle key={i} cx={`${cx}%`} cy={`${cy}%`} r={topo.center && cx===topo.center[0] && cy===topo.center[1] ? 5 : 4}
                      fill={topo.center && cx===topo.center[0] && cy===topo.center[1] ? '#2997ff' : 'rgba(41,151,255,0.5)'}
                      stroke="rgba(41,151,255,0.8)" strokeWidth="0.8" />
                  ))}
                </svg>
                <h3 className="topo-label">{topo.label}</h3>
                <p className="topo-desc">{topo.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Verbindungsaufbau Steps ── Nummerierter Schritt-für-Schritt-Ablauf eines P2P-Verbindungsaufbaus */}
      <section className="fw-section fw-section-black" ref={stepsRef}>
        <div className="fw-wrap">
          <p className="fw-eyebrow" data-reveal data-delay="0">{f.steps.eyebrow}</p>
          <h2 className="fw-section-title" data-reveal data-delay="1">{f.steps.heading}</h2>
          <div className="fw-steps">
            {/* Jeder Schritt erhält seinen eigenen data-delay-Wert (entspricht dem Array-Index),
                damit die Karten nacheinander eingeblendet werden. */}
            {f.steps.items.map((s, i) => (
              <div key={s.num} className="fw-step" data-reveal data-delay={i}>
                {/* Schrittnummer als visueller Akzent (z. B. „01", „02" …) */}
                <div className="fw-step-num">{s.num}</div>
                <div className="fw-step-body">
                  <h3 className="fw-step-title">{s.titel}</h3>
                  <p className="fw-step-text">{s.text}</p>
                </div>
                {/* Verbindungslinie zwischen den Schritten — wird beim letzten Element weggelassen */}
                {i < f.steps.items.length - 1 && <div className="fw-step-connector" aria-hidden="true" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DHT ── Zweispaltiger Bereich: linke Spalte Text, rechte Spalte SVG-Diagramm des DHT-Rings */}
      <section className="fw-section fw-section-dark" ref={dhtRef}>
        <div className="fw-wrap fw-two-col">
          {/* Linke Spalte: Erklärungstext zur Distributed Hash Table */}
          <div className="fw-col-text">
            {/* Eyebrow zeigt den technischen Fachbegriff — hier nicht übersetzt, da international gebräuchlich */}
            <p className="fw-eyebrow" data-reveal data-delay="0">Distributed Hash Table</p>
            <h2 className="fw-section-title" data-reveal data-delay="1">{f.dht.heading}</h2>
            {/* Erster Absatz: erklärt, was ein DHT-Schlüssel ist.
                p1_pre + <strong>p1_strong</strong> + p1_end bilden zusammen einen formatierten Satz. */}
            <p className="fw-body" data-reveal data-delay="2">
              {f.dht.p1_pre}<strong>{f.dht.p1_strong}</strong>{f.dht.p1_end}
            </p>
            {/* Zweiter Absatz: erklärt den Lookup-Mechanismus.
                Kombination aus normalem Text, <strong>-Hervorhebung und <em>-Kursivierung. */}
            <p className="fw-body" data-reveal data-delay="3">
              {f.dht.p2_pre}<strong>{f.dht.p2_strong}</strong>{f.dht.p2_mid}<em>{f.dht.p2_em}</em>{f.dht.p2_end}
            </p>
          </div>
          {/* Rechte Spalte: SVG-Visualisierung eines DHT-Rings mit 6 Knoten */}
          <div className="fw-col-visual" data-reveal data-delay="2">
            <div className="dht-diagram">
              {/*
                SVG-Diagramm eines DHT-Rings:
                - 6 Knoten (Node A–F) sind gleichmäßig auf einem gedachten Kreis verteilt
                - Jeder Knoten ist über eine Linie mit seinem Nachfolger verbunden (Ring-Topologie)
                - Gestrichelte Linien verbinden jeden Knoten mit dem zentralen KEY-Knoten (Lookup-Pfad)
                - Der zentrale Kreis (cx=110, cy=110) stellt den gesuchten Hash-Key dar
              */}
              <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                {[
                  {cx:110,cy:30,  label:'Node A'},
                  {cx:190,cy:80,  label:'Node B'},
                  {cx:190,cy:140, label:'Node C'},
                  {cx:110,cy:190, label:'Node D'},
                  {cx:30, cy:140, label:'Node E'},
                  {cx:30, cy:80,  label:'Node F'},
                ].map((n,i,arr) => {
                  // Nächster Knoten im Ring (Modulo-Wrap: nach Node F kommt wieder Node A)
                  const next = arr[(i+1)%arr.length];
                  return (
                    <g key={n.label}>
                      {/* Verbindungslinie zum nächsten Knoten im Ring */}
                      <line x1={n.cx} y1={n.cy} x2={next.cx} y2={next.cy} stroke="rgba(41,151,255,0.2)" strokeWidth="1"/>
                      {/* Gestrichelte Linie zum Mittelpunkt (symbolisiert den Lookup-Pfad zum KEY) */}
                      <line x1={n.cx} y1={n.cy} x2={110} y2={110} stroke="rgba(41,151,255,0.1)" strokeWidth="0.8" strokeDasharray="3 4"/>
                      {/* Knoten-Kreis mit schwach blauem Hintergrund und Rahmen */}
                      <circle cx={n.cx} cy={n.cy} r="14" fill="rgba(41,151,255,0.08)" stroke="rgba(41,151,255,0.4)" strokeWidth="1"/>
                      {/* Knotenbezeichnung (Node A – F) innerhalb des Kreises */}
                      <text x={n.cx} y={n.cy+4} textAnchor="middle" fill="#86868b" fontSize="5.5" fontFamily="-apple-system,sans-serif" fontWeight="500">{n.label}</text>
                    </g>
                  );
                })}
                {/* Zentraler KEY-Knoten: repräsentiert den Hash-Schlüssel, nach dem im DHT gesucht wird */}
                <circle cx="110" cy="110" r="18" fill="rgba(41,151,255,0.12)" stroke="#2997ff" strokeWidth="1.2"/>
                <text x="110" y="107" textAnchor="middle" fill="#2997ff" fontSize="6" fontFamily="-apple-system,sans-serif" fontWeight="600">KEY</text>
                <text x="110" y="117" textAnchor="middle" fill="#515154" fontSize="5.5" fontFamily="-apple-system,sans-serif">Hash</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── NAT Traversal ── Ablauf des NAT-Traversal-Prozesses als horizontale Karten-Reihe mit Pfeilen */}
      <section className="fw-section fw-section-black" ref={natRef}>
        <div className="fw-wrap">
          {/* Zentrierte Überschrift für den NAT-Abschnitt */}
          <p className="fw-eyebrow center-text" data-reveal data-delay="0">{f.nat.eyebrow}</p>
          <h2 className="fw-section-title center-text" data-reveal data-delay="1">{f.nat.heading}</h2>
          {/* Karten-Reihe: jede Karte beschreibt einen Schritt des NAT-Traversal-Prozesses.
              Zwischen den Karten wird ein Pfeil (→) als Trennelement eingefügt,
              außer nach der letzten Karte. React.Fragment vermeidet überflüssige DOM-Knoten. */}
          <div className="nat-cards" data-reveal data-delay="2">
            {f.nat.cards.map((card, i) => (
              <React.Fragment key={card.num}>
                {/* Hervorgehobene Karte (card.featured === true) erhält Zusatzklasse nat-card-featured */}
                <div className={`nat-card${card.featured ? ' nat-card-featured' : ''}`}>
                  <div className="nat-card-num">{card.num}</div>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </div>
                {/* Pfeil-Trenner zwischen den Karten — beim letzten Element weggelassen */}
                {i < f.nat.cards.length - 1 && (
                  <div className="nat-arrow" aria-hidden="true">→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
