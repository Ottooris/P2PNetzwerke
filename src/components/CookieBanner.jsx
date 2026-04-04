import { useState, useEffect } from 'react';
import '../styles/CookieBanner.css';

function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('cookies_accepted');
    if (stored === null) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookies_accepted', 'true');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookies_accepted', 'false');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <p className="cookie-banner__text">
        Diese Website verwendet keine Tracking-Cookies. Nur technisch notwendige Cookies werden eingesetzt.{' '}
        <span className="cookie-banner__note">Dieses Projekt ist eine Abschlussarbeit und erhebt keinerlei personenbezogene Daten.</span>
      </p>
      <div className="cookie-banner__actions">
        <button className="cookie-banner__btn cookie-banner__btn--accept" onClick={handleAccept}>
          Akzeptieren
        </button>
        <button className="cookie-banner__btn cookie-banner__btn--decline" onClick={handleDecline}>
          Ablehnen
        </button>
      </div>
    </div>
  );
}

export default CookieBanner;
