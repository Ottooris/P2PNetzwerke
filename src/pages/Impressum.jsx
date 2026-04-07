/**
 * Impressum.jsx
 *
 * Statische Impressums-Seite mit rechtlichen Pflichtangaben.
 * Die Seitenstruktur (Abschnitte, Texte) wird vollständig aus dem
 * i18n-Übersetzungsobjekt geladen — so bleibt die Komponente selbst
 * sprach- und inhaltsneutral und muss bei Textänderungen nicht angefasst werden.
 */
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../context/LangContext';
import t from '../i18n/translations';
import '../styles/Impressum.css';

function Impressum() {
  /* Aktive Sprache aus dem Kontext lesen und zugehörige Impressumstexte laden */
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

        {/* ── Abschnitte – alle Inhalte kommen aus den Übersetzungen, nicht aus dem Code ── */}
        <div className="impressum-content">
          {tx.sections.map((section, idx) => (
            <section key={idx} className="impressum-section">
              {/* Eyebrow-Label: kleines Kategorie-Schild über der Überschrift */}
              <span className="impressum-section__eyebrow">{section.eyebrow}</span>
              <h2 className="impressum-section__heading">{section.heading}</h2>
              <div className="impressum-section__body">
                {/* Jeder Eintrag im body-Array wird als eigenständiger Textabsatz gerendert */}
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
