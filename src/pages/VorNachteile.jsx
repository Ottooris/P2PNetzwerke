import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useReveal from '../hooks/useReveal';
import { useLang } from '../context/LangContext';
import t from '../i18n/translations';
import '../styles/VorNachteile.css';

/**
 * VorNachteile – Seite zur Gegenüberstellung von Vor- und Nachteilen.
 *
 * Aufbau: Hero-Bereich → zweispaltige Vor-/Nachteil-Liste → Fazit-Abschnitt.
 * Jeder Abschnitt erhält einen eigenen Scroll-Reveal-Ref, damit die
 * Einblend-Animation sektionsweise ausgelöst wird.
 *
 * @returns {JSX.Element} Die vollständige VorNachteile-Seite.
 */
export default function VorNachteile() {
  // Aktive Sprache aus dem globalen LangContext (z. B. "de" oder "en")
  const lang    = useLang();

  // Alle Texte für diese Seite auf einmal aus dem Übersetzungs-Objekt holen –
  // vermeidet wiederholtes t[lang].vorNachteile im JSX
  const vn      = t[lang].vorNachteile;

  // Separate Refs pro Abschnitt: useReveal beobachtet per IntersectionObserver,
  // wann der jeweilige Bereich ins Viewport scrollt, und setzt data-reveal-Attribute
  const heroRef   = useReveal();
  const splitRef  = useReveal();
  const fazitRef  = useReveal();

  return (
    <div className="vn-page">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────────
          Einstiegsbereich mit animiertem Hintergrund (Orbs) und dem
          Seitentitel. data-delay-Werte steuern die gestaffelte Einblendung. */}
      <section className="vn-hero" ref={heroRef}>
        {/* Dekorativer Hintergrund mit zwei farbigen Orbs (grün = Pro, rot = Con).
            aria-hidden verhindert, dass Screen-Reader diesen Bereich vorlesen. */}
        <div className="vn-hero-bg" aria-hidden="true">
          <div className="vn-orb vn-orb-green" />
          <div className="vn-orb vn-orb-red" />
        </div>
        <div className="vn-hero-content">
          <p className="vn-eyebrow" data-reveal data-delay="0">{vn.eyebrow}</p>
          <h1 className="vn-hero-title" data-reveal data-delay="1">
            {vn.heroTitle}
          </h1>
          {/* Zweizeiliger Untertitel – br.br-desk sorgt für den Zeilenumbruch
              nur auf Desktop-Breiten (via CSS display:none auf Mobilgeräten) */}
          <p className="vn-hero-sub" data-reveal data-delay="2">
            {vn.heroSub}<br className="br-desk" />
            {vn.heroSub2}
          </p>
        </div>
      </section>

      {/* ── Split-Sektion ────────────────────────────────────────────────────
          Zweispaltiger Vergleich: links Vorteile (Pro), rechts Nachteile (Con).
          Ein visueller Divider mit "vs." trennt beide Spalten optisch. */}
      <section className="vn-split-section" ref={splitRef}>
        <div className="vn-split-wrap">

          {/* Linke Spalte – Vorteile (Pro) */}
          <div className="vn-col vn-col-pro">
            {/* Spaltenkopf mit Plus-Zeichen als visuellem Marker */}
            <div className="vn-col-header" data-reveal data-delay="0">
              <span className="vn-col-sign vn-sign-pro">+</span>
              <div>
                <p className="vn-col-eyebrow vn-eyebrow-pro">{vn.proEyebrow}</p>
                <h2 className="vn-col-title">{vn.proTitle}</h2>
              </div>
            </div>
            {/* Vorteile-Liste: jedes Element wird mit seinem Index als data-delay
                versehen, sodass die Karten nacheinander von oben nach unten einblenden */}
            <ul className="vn-list">
              {vn.vorteile.map((item, i) => (
                <li
                  key={item.titel}
                  className="vn-item vn-item-pro"
                  data-reveal
                  data-delay={i}
                >
                  <div className="vn-item-inner">
                    <h3 className="vn-item-title">{item.titel}</h3>
                    <p className="vn-item-text">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Vertikaler Trennbereich mit "vs."-Label zwischen den Spalten */}
          <div className="vn-divider" aria-hidden="true">
            <div className="vn-divider-line" />
            <div className="vn-divider-label">vs.</div>
            <div className="vn-divider-line" />
          </div>

          {/* Rechte Spalte – Nachteile (Con) */}
          <div className="vn-col vn-col-con">
            {/* Spaltenkopf mit Minus-Zeichen als visuellem Marker */}
            <div className="vn-col-header" data-reveal data-delay="0">
              <span className="vn-col-sign vn-sign-con">−</span>
              <div>
                <p className="vn-col-eyebrow vn-eyebrow-con">{vn.conEyebrow}</p>
                <h2 className="vn-col-title">{vn.conTitle}</h2>
              </div>
            </div>
            {/* Nachteile-Liste: gleiche gestaffelte Einblend-Logik wie bei den Vorteilen */}
            <ul className="vn-list">
              {vn.nachteile.map((item, i) => (
                <li
                  key={item.titel}
                  className="vn-item vn-item-con"
                  data-reveal
                  data-delay={i}
                >
                  <div className="vn-item-inner">
                    <h3 className="vn-item-title">{item.titel}</h3>
                    <p className="vn-item-text">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      {/* ── Fazit-Abschnitt ──────────────────────────────────────────────────
          Abschließende Bewertung nach dem Vergleich. Besteht aus zwei
          Fließtextabsätzen und einem hervorgehobenen Verdict-Block. */}
      <section className="vn-fazit-section" ref={fazitRef}>
        <div className="vn-fazit-wrap">
          <p className="vn-eyebrow vn-eyebrow-center" data-reveal data-delay="0">{vn.fazitEyebrow}</p>
          <h2 className="vn-fazit-title" data-reveal data-delay="1">
            {vn.fazitTitle}
          </h2>
          <p className="vn-fazit-body" data-reveal data-delay="2">
            {vn.fazitBody1}
          </p>
          {/* Zweiter Absatz mit kursiv hervorgehobenem Mittelteil (em-Tag) */}
          <p className="vn-fazit-body" data-reveal data-delay="3">
            {vn.fazitBody2_pre}<em>{vn.fazitBody2_em}</em>{vn.fazitBody2_post}
          </p>
          {/* Fazit-Box: kompaktes Label + abschließendes Urteil als Zusammenfassung */}
          <div className="vn-fazit-verdict" data-reveal data-delay="4">
            <span className="vn-verdict-label">{vn.verdictLabel}</span>
            <p className="vn-verdict-text">
              {vn.verdictText}
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
