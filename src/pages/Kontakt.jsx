import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../context/LangContext';
import t from '../i18n/translations';
import '../styles/Kontakt.css';

function Kontakt() {
  /* Aktive Sprache und Übersetzungen laden */
  const lang = useLang();
  const tx = t[lang].kontakt;

  /* Formularzustand: Felder, Validierungsfehler und Erfolgsstatus */
  const [fields, setFields] = useState({ name: '', email: '', message: '' });
  const [error, setError]   = useState(false);
  const [sent, setSent]     = useState(false);

  /* Feldwerte aktualisieren */
  function handleChange(e) {
    setFields(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(false);
  }

  /* Formular absenden – öffnet den Mail-Client mit vorausgefüllten Daten */
  function handleSubmit(e) {
    e.preventDefault();

    /* Alle Felder müssen ausgefüllt sein */
    if (!fields.name.trim() || !fields.email.trim() || !fields.message.trim()) {
      setError(true);
      return;
    }

    /* mailto: Link zusammenbauen */
    const subject = encodeURIComponent(`Nachricht von ${fields.name}`);
    const body    = encodeURIComponent(
      `Name: ${fields.name}\nE-Mail: ${fields.email}\n\n${fields.message}`
    );
    window.location.href = `mailto:maxieppacherr@gmail.com?subject=${subject}&body=${body}`;

    /* Erfolgsanzeige und Formular zurücksetzen */
    setSent(true);
    setFields({ name: '', email: '', message: '' });
  }

  return (
    <>
      <Navbar />

      <main className="kontakt-page">

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="kontakt-hero">
          <p className="kontakt-eyebrow">{tx.eyebrow}</p>
          <h1 className="kontakt-title">{tx.title}</h1>
          <p className="kontakt-subtitle">{tx.subtitle}</p>
        </section>

        {/* ── Über dieses Projekt ──────────────────────────── */}
        <section className="kontakt-section">
          <div className="kontakt-section-inner">
            <h2 className="kontakt-section-label">{tx.aboutLabel}</h2>
            <div className="kontakt-prose">
              <p>{tx.aboutP1}</p>
              <p>{tx.aboutP2}</p>
            </div>
          </div>
        </section>

        {/* ── Angaben / Details ────────────────────────────── */}
        <section className="kontakt-section">
          <div className="kontakt-section-inner">
            <h2 className="kontakt-section-label">{tx.detailsLabel}</h2>
            <dl className="kontakt-meta-list">
              {/* Name */}
              <div className="kontakt-meta-row">
                <dt className="kontakt-meta-key">{tx.metaName}</dt>
                <dd className="kontakt-meta-value">Maximilian Eppacher</dd>
              </div>
              {/* Schule */}
              <div className="kontakt-meta-row">
                <dt className="kontakt-meta-key">{tx.metaSchool}</dt>
                <dd className="kontakt-meta-value">{tx.schoolName}</dd>
              </div>
              {/* E-Mail */}
              <div className="kontakt-meta-row">
                <dt className="kontakt-meta-key">{tx.metaEmail}</dt>
                <dd className="kontakt-meta-value">
                  <a href="mailto:maxieppacherr@gmail.com" className="kontakt-link">
                    maxieppacherr@gmail.com
                  </a>
                </dd>
              </div>
              {/* Schuljahr */}
              <div className="kontakt-meta-row">
                <dt className="kontakt-meta-key">{tx.metaYear}</dt>
                <dd className="kontakt-meta-value">2025 / 2026</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* ── Kontaktformular ──────────────────────────────── */}
        <section className="kontakt-section kontakt-section--last">
          <div className="kontakt-section-inner">
            <h2 className="kontakt-section-label">{tx.formLabel}</h2>

            {/* Erfolgsmeldung nach dem Absenden */}
            {sent ? (
              <div className="kontakt-form-success">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {tx.formSuccess}
              </div>
            ) : (
              /* Eigenes Kontaktformular */
              <form className="kontakt-form" onSubmit={handleSubmit} noValidate>

                {/* Fehlerhinweis */}
                {error && (
                  <p className="kontakt-form-error" role="alert">{tx.formError}</p>
                )}

                {/* Name-Feld */}
                <div className="kontakt-form-group">
                  <label className="kontakt-form-label" htmlFor="kf-name">
                    {tx.formNameLbl}
                  </label>
                  <input
                    id="kf-name"
                    name="name"
                    type="text"
                    className="kontakt-form-input"
                    placeholder={tx.formNamePh}
                    value={fields.name}
                    onChange={handleChange}
                    autoComplete="name"
                  />
                </div>

                {/* E-Mail-Feld */}
                <div className="kontakt-form-group">
                  <label className="kontakt-form-label" htmlFor="kf-email">
                    {tx.formEmailLbl}
                  </label>
                  <input
                    id="kf-email"
                    name="email"
                    type="email"
                    className="kontakt-form-input"
                    placeholder={tx.formEmailPh}
                    value={fields.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                </div>

                {/* Nachrichten-Textarea */}
                <div className="kontakt-form-group">
                  <label className="kontakt-form-label" htmlFor="kf-message">
                    {tx.formMsgLbl}
                  </label>
                  <textarea
                    id="kf-message"
                    name="message"
                    className="kontakt-form-textarea"
                    placeholder={tx.formMsgPh}
                    rows={5}
                    value={fields.message}
                    onChange={handleChange}
                  />
                </div>

                {/* Absende-Button */}
                <button type="submit" className="kontakt-form-submit">
                  {tx.formSubmit}
                  {/* Pfeil-Icon */}
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </button>

              </form>
            )}
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}

export default Kontakt;
