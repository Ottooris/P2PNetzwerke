import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import t from '../i18n/translations';
import '../styles/Footer.css';

export default function Footer() {
  const lang = useLang();
  const f    = t[lang].footer;

  return (
    <footer className="footer">
      <div className="footer-inner">

        <div className="footer-top">
          <Link to={`/${lang}`} className="footer-logo">P2P<span>Netzwerke</span></Link>

          <div className="footer-links">
            <div className="footer-col">
              <p className="footer-col-title">{f.projekt}</p>
              <Link to={`/${lang}`}>{f.start}</Link>
              <Link to={`/${lang}/kontakt`}>{f.kontakt}</Link>
            </div>
            <div className="footer-col">
              <p className="footer-col-title">{f.rechtlich}</p>
              <Link to={`/${lang}/impressum`}>{f.impressum}</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} P2PNetzwerke · {f.copy}</p>
          <div className="footer-bottom-links">
            <Link to={`/${lang}/impressum`}>{f.impressum}</Link>
            <Link to={`/${lang}/kontakt`}>{f.kontakt}</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
