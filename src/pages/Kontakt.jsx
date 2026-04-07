/**
 * @page Kontakt
 * @description Kontaktseite des P2P-Netzwerke-Schulprojekts.
 *
 * Die Seite gliedert sich in drei Bereiche:
 *  1. Hero – kurze Einleitung zur Seite
 *  2. Projektinfo & persönliche Angaben – wer steckt hinter dem Projekt
 *  3. Kontaktformular – der Besucher kann direkt eine E-Mail schicken,
 *     ohne dass ein eigener Server benötigt wird (mailto-Ansatz)
 *
 * Sprachunterstützung erfolgt über den globalen LangContext;
 * alle sichtbaren Texte kommen aus der zentralen Übersetzungsdatei.
 */
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../context/LangContext';
import t from '../i18n/translations';
import '../styles/Kontakt.css';

function Kontakt() {
  /* Aktive Sprache aus dem globalen Kontext lesen,
     dann den passenden Übersetzungs-Namespace für diese Seite laden */
  const lang = useLang();
  const tx = t[lang].kontakt;

  /* Formularzustand mit drei Teilen:
     - fields: die aktuellen Eingabewerte aller Felder
     - error:  wird true, wenn ein Pflichtfeld leer geblieben ist
     - sent:   wird true, nachdem das Formular erfolgreich abgesendet wurde */
  const [fields, setFields] = useState({ name: '', email: '', message: '' });
  const [error, setError]   = useState(false);
  const [sent, setSent]     = useState(false);

  /**
   * handleChange – wird bei jeder Tastatureingabe aufgerufen.
   * Wir nutzen den Feldnamen (e.target.name) als dynamischen Schlüssel,
   * damit eine einzige Funktion alle drei Felder abdeckt.
   * Gleichzeitig löschen wir eine eventuell angezeigte Fehlermeldung,
   * sobald der Nutzer wieder tippt.
   */
  function handleChange(e) {
    setFields(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(false);
  }

  /**
   * handleSubmit – wird beim Klick auf "Absenden" ausgelöst.
   *
   * Schritt 1: Standardverhalten des Browsers (Seitenreload) unterdrücken.
   * Schritt 2: Validierung – sind alle drei Felder ausgefüllt?
   *            Falls nicht, Fehlerstatus setzen und abbrechen.
   * Schritt 3: mailto-Link zusammenbauen.
   *            encodeURIComponent stellt sicher, dass Sonderzeichen und
   *            Umlaute korrekt in der URL kodiert werden.
   *            Das Öffnen des Links übergibt die Daten direkt an den
   *            installierten E-Mail-Client – kein eigener Server nötig.
   * Schritt 4: Erfolgsstatus setzen und Formularfelder leeren.
   */
  function handleSubmit(e) {
    e.preventDefault();

    /* Validierung: alle drei Felder müssen mindestens ein Zeichen enthalten */
    if (!fields.name.trim() || !fields.email.trim() || !fields.message.trim()) {
      setError(true);
      return;
    }

    /* Betreff und Nachrichtentext URL-sicher kodieren,
       damit Umlaute und Sonderzeichen nicht den Link kaputt machen */
    const subject = encodeURIComponent(`Nachricht von ${fields.name}`);
    const body    = encodeURIComponent(
      `Name: ${fields.name}\nE-Mail: ${fields.email}\n\n${fields.message}`
    );
    /* Den mailto-Link aufrufen – das öffnet den Standard-E-Mail-Client
       mit vorausgefülltem Empfänger, Betreff und Nachricht */
    window.location.href = `mailto:maxieppacherr@gmail.com?subject=${subject}&body=${body}`;

    /* Formular als "gesendet" markieren und alle Felder zurücksetzen */
    setSent(true);
    setFields({ name: '', email: '', message: '' });
  }

  return (
    <>
      <Navbar />

      <main className="kontakt-page">

        {/* ── Hero: Seitenüberschrift und kurze Einleitung ─────────────── */}
        <section className="kontakt-hero">
          <p className="kontakt-eyebrow">{tx.eyebrow}</p>
          <h1 className="kontakt-title">{tx.title}</h1>
          <p className="kontakt-subtitle">{tx.subtitle}</p>
        </section>

        {/* ── Über dieses Projekt: kurze Beschreibung des Schulprojekts ── */}
        <section className="kontakt-section">
          <div className="kontakt-section-inner">
            <h2 className="kontakt-section-label">{tx.aboutLabel}</h2>
            <div className="kontakt-prose">
              <p>{tx.aboutP1}</p>
              <p>{tx.aboutP2}</p>
            </div>
          </div>
        </section>

        {/* ── Persönliche Angaben: Name, Schule, E-Mail, Schuljahr ─────── */}
        <section className="kontakt-section">
          <div className="kontakt-section-inner">
            <h2 className="kontakt-section-label">{tx.detailsLabel}</h2>
            {/* dl/dt/dd ist semantisch korrekt für Schlüssel-Wert-Paare */}
            <dl className="kontakt-meta-list">
              {/* Name des Projektautors */}
              <div className="kontakt-meta-row">
                <dt className="kontakt-meta-key">{tx.metaName}</dt>
                <dd className="kontakt-meta-value">Maximilian Eppacher</dd>
              </div>
              {/* Schule, an der das Projekt eingereicht wird */}
              <div className="kontakt-meta-row">
                <dt className="kontakt-meta-key">{tx.metaSchool}</dt>
                <dd className="kontakt-meta-value">{tx.schoolName}</dd>
              </div>
              {/* Direkt anklickbarer E-Mail-Link */}
              <div className="kontakt-meta-row">
                <dt className="kontakt-meta-key">{tx.metaEmail}</dt>
                <dd className="kontakt-meta-value">
                  <a href="mailto:maxieppacherr@gmail.com" className="kontakt-link">
                    maxieppacherr@gmail.com
                  </a>
                </dd>
              </div>
              {/* Schuljahr, in dem das Projekt entstanden ist */}
              <div className="kontakt-meta-row">
                <dt className="kontakt-meta-key">{tx.metaYear}</dt>
                <dd className="kontakt-meta-value">2025 / 2026</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* ── Kontaktformular ──────────────────────────────────────────── */}
        <section className="kontakt-section kontakt-section--last">
          <div className="kontakt-section-inner">
            <h2 className="kontakt-section-label">{tx.formLabel}</h2>

            {/* Wurde das Formular bereits abgesendet, zeigen wir eine
                Bestätigungsmeldung mit Haken-Icon statt des Formulars */}
            {sent ? (
              <div className="kontakt-form-success">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {tx.formSuccess}
              </div>
            ) : (
              /* Das eigentliche Formular – noValidate deaktiviert die
                 Browser-eigene Validierung, wir übernehmen das selbst */
              <form className="kontakt-form" onSubmit={handleSubmit} noValidate>

                {/* Fehlermeldung erscheint nur, wenn ein Pflichtfeld leer ist;
                    role="alert" sorgt dafür, dass Screenreader sie vorlesen */}
                {error && (
                  <p className="kontakt-form-error" role="alert">{tx.formError}</p>
                )}

                {/* Eingabefeld für den Namen */}
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

                {/* Eingabefeld für die E-Mail-Adresse */}
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

                {/* Mehrzeiliges Textfeld für die eigentliche Nachricht */}
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

                {/* Absende-Button löst handleSubmit aus */}
                <button type="submit" className="kontakt-form-submit">
                  {tx.formSubmit}
                  {/* Dekoratives Pfeil-Icon zur visuellen Verstärkung */}
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
