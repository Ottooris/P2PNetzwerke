import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../context/LangContext';
import t from '../i18n/translations';
import '../styles/Impressum.css';

function Impressum() {
  /* Aktive Sprache und Übersetzungen laden */
  const lang = useLang();
  const tx = t[lang].impressum;

  return (
    <>
      <Navbar />

      <main className="impressum-page">

        {/* ── Hero-Bereich ─────────────────────────────────── */}
        <section className="impressum-hero">
          <h1 className="impressum-hero__title">{tx.heroTitle}</h1>
          <p className="impressum-hero__subtitle">{tx.heroSubtitle}</p>
        </section>

        {/* ── Abschnitte – werden dynamisch aus den Übersetzungen gerendert ── */}
        <div className="impressum-content">
          {tx.sections.map((section, idx) => (
            <section key={idx} className="impressum-section">
              {/* Kleines Label über der Überschrift */}
              <span className="impressum-section__eyebrow">{section.eyebrow}</span>
              <h2 className="impressum-section__heading">{section.heading}</h2>
              <div className="impressum-section__body">
                {/* Jeder Eintrag im body-Array wird als eigener Absatz gerendert */}
                {section.body.map((paragraph, pIdx) => (
                  <p key={pIdx}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

      </main>

      <Footer />
    </>
  );
}

export default Impressum;
