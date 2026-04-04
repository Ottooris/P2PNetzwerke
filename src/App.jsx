import { BrowserRouter, Routes, Route, Navigate, Outlet, useParams } from 'react-router-dom';
import './App.css';
import { LangContext } from './context/LangContext';
import Home           from './pages/Home';
import Funktionsweise from './pages/Funktionsweise';
import Anwendungen    from './pages/Anwendungen';
import VorNachteile   from './pages/VorNachteile';
import Geschichte     from './pages/Geschichte';
import Netzwerk       from './pages/Netzwerk';
import Impressum      from './pages/Impressum';
import Kontakt        from './pages/Kontakt';
import NotFound       from './pages/NotFound';
import CookieBanner   from './components/CookieBanner';

const VALID_LANGS = ['de', 'it', 'en'];

function LangLayout() {
  const { lang } = useParams();
  const safeLang = VALID_LANGS.includes(lang) ? lang : 'de';
  if (!VALID_LANGS.includes(lang)) {
    return <Navigate to={`/de`} replace />;
  }
  return (
    <LangContext.Provider value={safeLang}>
      <Outlet />
    </LangContext.Provider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <div className="ambient-bg" aria-hidden="true">
          <div className="amb amb-1" />
          <div className="amb amb-2" />
          <div className="amb amb-3" />
          <div className="amb amb-4" />
          <div className="amb amb-5" />
        </div>

        <Routes>
          {/* Redirect bare root to German */}
          <Route path="/" element={<Navigate to="/de" replace />} />

          {/* Language-prefixed routes */}
          <Route path="/:lang" element={<LangLayout />}>
            <Route index                  element={<Home />}           />
            <Route path="funktionsweise"  element={<Funktionsweise />} />
            <Route path="anwendungen"     element={<Anwendungen />}    />
            <Route path="vor-nachteile"   element={<VorNachteile />}   />
            <Route path="geschichte"      element={<Geschichte />}     />
            <Route path="simulator"       element={<Netzwerk />}       />
            <Route path="impressum"       element={<Impressum />}      />
            <Route path="kontakt"         element={<Kontakt />}        />
            <Route path="*"               element={<NotFound />}       />
          </Route>

          {/* Catch-all → German home */}
          <Route path="*" element={<Navigate to="/de" replace />} />
        </Routes>

        <CookieBanner />
      </div>
    </BrowserRouter>
  );
}

export default App;
