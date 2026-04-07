import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useReveal from '../hooks/useReveal';
import { useLang } from '../context/LangContext';
import t from '../i18n/translations';
import '../styles/Geschichte.css';

/**
 * Geschichte – Seite zur schulischen Geschichte / Chronik.
 *
 * Die Komponente zeigt einen Hero-Bereich mit Überschrift sowie eine
 * vertikale Timeline, die bedeutende Ereignisse der Schule darstellt.
 * Alle Texte kommen aus dem i18n-Übersetzungsobjekt und werden
 * abhängig von der aktuell gewählten Sprache geladen.
 */
export default function Geschichte() {
  // Aktuelle Sprache aus dem globalen LangContext lesen (z. B. 'de' oder 'en')
  const lang = useLang();
  // Abkürzung auf den deutschen/englischen Geschichte-Teilbaum der Übersetzungen
  const g = t[lang].geschichte;

  // Separate Reveal-Refs, damit Hero und Timeline unabhängig eingeblendet werden
  const heroRef     = useReveal();
  const timelineRef = useReveal();

  /* Fügt der Navbar einen Schatten hinzu, sobald der Nutzer nach unten scrollt */
  useEffect(() => {
    const nav = document.querySelector('.navbar');
    const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="geschichte">
      <Navbar />

      {/* ── Hero ── */}
      {/* Einleitungsbereich mit dekorativen Hintergrund-Orbs und dem Seitentitel */}
      <section className="g-hero" ref={heroRef}>
        {/* Rein dekorativer Hintergrund: zwei Leuchtkreise + Gittermuster */}
        <div className="g-hero-bg" aria-hidden="true">
          <div className="g-hero-orb g-hero-orb-1" />
          <div className="g-hero-orb g-hero-orb-2" />
          <div className="g-hero-grid" />
        </div>
        {/* Textinhalt des Heros – data-delay steuert die gestaffelte Einblend-Animation */}
        <div className="g-hero-content">
          <p className="g-eyebrow" data-reveal data-delay="0">{g.eyebrow}</p>
          <h1 className="g-hero-title" data-reveal data-delay="1">{g.title}</h1>
          <p className="g-hero-sub" data-reveal data-delay="2">
            {g.sub}
          </p>
        </div>
      </section>

      {/* ── Timeline ── */}
      {/* Bereich mit der vertikalen Zeitleiste aller historischen Einträge */}
      <section className="g-timeline-section">
        <div className="g-timeline-wrap" ref={timelineRef}>
          {/* Zentrale vertikale Linie, die die gesamte Zeitleiste durchzieht */}
          <div className="g-timeline-line" aria-hidden="true" />

          {/*
            Jeder Eintrag aus g.timeline wird als Karte gerendert.
            Der Index i bestimmt per Modulo, ob die Karte links (i % 2 === 0)
            oder rechts (i % 2 !== 0) der Mittellinie erscheint – so entsteht
            das abwechselnde Zickzack-Layout der Timeline.
            data-delay wird auf 0–4 begrenzt (Math.min), um übermäßige
            Verzögerungen bei langen Listen zu vermeiden.
          */}
          {g.timeline.map((entry, i) => (
            <div
              key={entry.year}
              className={`g-entry g-entry--${i % 2 === 0 ? 'left' : 'right'}`}
              data-reveal
              data-delay={Math.min(i % 3, 4)}
            >
              {/* Kreisförmiger Verbindungspunkt auf der Mittellinie — markiert den Zeitpunkt */}
              <div className="g-entry-dot" aria-hidden="true" />

              {/* Inhaltskarte mit Jahr, Titel, Untertitel und Beschreibungstext */}
              <div className="g-card">
                <span className="g-year">{entry.year}</span>
                <h3 className="g-card-title">{entry.title}</h3>
                <p className="g-card-subtitle">{entry.subtitle}</p>
                <p className="g-card-text">{entry.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
