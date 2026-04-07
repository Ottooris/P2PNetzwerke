import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop – springt bei jedem Routenwechsel sofort ans Seitenanfang.
 *
 * React Router scrollt in einer SPA nicht automatisch nach oben, wenn der
 * Nutzer auf einen internen Link klickt. Diese Komponente löst das:
 * Sobald sich der `pathname` ändert (= neue Seite wird geladen), wird
 * `window.scrollTo` mit `behavior: 'instant'` aufgerufen, damit kein
 * sichtbares Scrollen stattfindet, sondern die Seite einfach oben startet.
 *
 * Die Komponente rendert nichts — sie ist ein reiner Nebeneffekt-Hook.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 'instant' statt 'smooth': Nutzer soll die neue Seite sofort oben sehen,
    // kein animiertes Hochscrollen das irritiert oder verzögert
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
