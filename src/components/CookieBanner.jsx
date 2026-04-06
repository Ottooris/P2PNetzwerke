import { useState, useEffect } from 'react';
import { useLang } from '../context/LangContext';
import t from '../i18n/translations';
import '../styles/CookieBanner.css';

function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const lang = useLang();
  const c = t[lang].cookie;

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
        {c.text}{' '}
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
