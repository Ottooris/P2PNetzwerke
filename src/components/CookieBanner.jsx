import { useState, useEffect } from 'react';
import { useLang } from '../context/LangContext';
import t from '../i18n/translations';
import '../styles/CookieBanner.css';

function CookieBanner() {
  // Banner ist standardmäßig unsichtbar — wird nur angezeigt, wenn noch keine Entscheidung gespeichert ist
  const [visible, setVisible] = useState(false);

  // Aktuelle Sprache aus dem Kontext; c enthält alle übersetzten Cookie-Texte
  const lang = useLang();
  const c = t[lang].cookie;

  useEffect(() => {
    // localStorage prüfen: Wurde die Entscheidung bereits getroffen?
    // Ist der Wert null, erscheint das Banner nach 1 Sekunde Verzögerung.
    // Cleanup-Funktion verhindert einen State-Update nach Unmount.
    const stored = localStorage.getItem('cookies_accepted');
    if (stored === null) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Nutzer akzeptiert: Entscheidung in localStorage schreiben, Banner ausblenden
  const handleAccept = () => {
    localStorage.setItem('cookies_accepted', 'true');
    setVisible(false);
  };

  // Nutzer lehnt ab: ebenfalls speichern, damit das Banner nicht erneut erscheint
  const handleDecline = () => {
    localStorage.setItem('cookies_accepted', 'false');
    setVisible(false);
  };

  // Nichts rendern, solange das Banner nicht sichtbar sein soll
  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <p className="cookie-banner__text">
        {c.text}{' '}
        {/* Hinweistext: kein Tracking, reine Abschlussarbeit */}
        <span className="cookie-banner__note">{c.note}</span>
      </p>
      <div className="cookie-banner__actions">
        <button className="cookie-banner__btn cookie-banner__btn--accept" onClick={handleAccept}>
          {c.accept}
        </button>
        <button className="cookie-banner__btn cookie-banner__btn--decline" onClick={handleDecline}>
          {c.decline}
        </button>
      </div>
    </div>
  );
}

export default CookieBanner;
