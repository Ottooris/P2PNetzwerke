/**
 * @file NotFound.jsx
 * @description 404-Fehlerseite der P2P-Netzwerke-App.
 *
 * Diese Seite wird angezeigt, wenn eine Route nicht gefunden wird.
 * Sie greift das P2P-Thema visuell auf: Im Hintergrund läuft ein
 * animiertes Mini-Netzwerk aus Knoten und Kanten (NODES/EDGES),
 * und die Null in "404" ist als "gebrochener Ring" gestaltet —
 * ein Knoten, der aus dem Netzwerk gefallen ist.
 *
 * Sprache und Texte werden vollständig über das i18n-System gesteuert,
 * sodass die Seite mehrsprachig funktioniert.
 */

import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useLang } from '../context/LangContext';
import t from '../i18n/translations';
import '../styles/NotFound.css';

/*
 * NODES und EDGES sind statische Daten und werden AUSSERHALB der Komponente
 * definiert. Das ist bewusst so: React würde sie sonst bei jedem Re-Render
 * neu erzeugen, obwohl sie sich nie ändern. Außerhalb der Komponente werden
 * sie nur einmal beim Laden des Moduls erstellt — das spart unnötige Arbeit.
 *
 * NODES: neun Punkte mit x/y-Koordinaten (in Prozent des SVG-Viewports),
 *        die die Peers im Hintergrundnetzwerk repräsentieren.
 */
const NODES = [
  { x: 15, y: 20 }, { x: 82, y: 12 }, { x: 55, y: 38 },
  { x: 28, y: 60 }, { x: 70, y: 65 }, { x: 90, y: 40 },
  { x: 10, y: 80 }, { x: 48, y: 82 }, { x: 78, y: 88 },
];

/*
 * EDGES: Liste von Verbindungen zwischen den Knoten, je als Index-Paar [a, b].
 * Zum Beispiel bedeutet [0, 2]: Knoten 0 ist mit Knoten 2 verbunden.
 * Das spiegelt die typische Struktur eines P2P-Netzwerks wider,
 * in dem jeder Peer direkte Verbindungen zu mehreren anderen Peers hat.
 */
const EDGES = [
  [0, 2], [1, 2], [1, 5], [2, 3], [2, 4], [2, 5],
  [3, 6], [4, 7], [5, 8], [6, 7], [7, 8],
];

export default function NotFound() {
  /* Aktive Sprache aus dem globalen Kontext lesen — z. B. "de" oder "it" */
  const lang = useLang();

  /* Den passenden Übersetzungs-Block für die 404-Seite auswählen */
  const tx = t[lang].notFound;

  return (
    <div className="nf-page">
      {/* Navigationsleiste — bleibt auf der 404-Seite sichtbar */}
      <Navbar />

      {/* Hintergrundebene 1: Das animierte P2P-Netzwerk aus Knoten und Kanten.
          aria-hidden="true" blendet es für Screenreader aus — es ist rein dekorativ. */}
      <div className="nf-net-bg" aria-hidden="true">
        {/* Das SVG füllt den gesamten Hintergrund und wird proportional skaliert */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="nf-net-svg">

          {/* Kanten zeichnen: Für jedes Index-Paar [a, b] wird eine Linie
              zwischen den entsprechenden NODES-Koordinaten gerendert.
              Der Key `a-b` ist eindeutig, weil jede Kante nur einmal vorkommt. */}
          {EDGES.map(([a, b]) => (
            <line
              key={`${a}-${b}`}
              x1={NODES[a].x} y1={NODES[a].y}
              x2={NODES[b].x} y2={NODES[b].y}
              className="nf-net-edge"
            />
          ))}

          {/* Knoten zeichnen: Für jeden Eintrag in NODES wird ein kleiner Kreis gesetzt.
              Radius 1.2 hält die Punkte dezent — sie sollen nicht vom Inhalt ablenken. */}
          {NODES.map((n, i) => (
            <circle key={i} cx={n.x} cy={n.y} r="1.2" className="nf-net-node" />
          ))}
        </svg>
      </div>

      {/* Hintergrundebene 2: Drei weiche Farbkreise ("Orbs") für die Tiefenwirkung.
          Sie sind rein visuell und für assistive Technologien ausgeblendet. */}
      <div className="nf-orbs" aria-hidden="true">
        <div className="nf-orb nf-orb-1" />
        <div className="nf-orb nf-orb-2" />
        <div className="nf-orb nf-orb-3" />
      </div>

      <main className="nf-main">
        {/* Kleines Label über der 404-Zahl — gibt dem Fehler einen thematischen Kontext */}
        <p className="nf-eyebrow">{tx.eyebrow}</p>

        {/* Die große "404"-Anzeige. aria-hidden="true", weil der Titel darunter
            den Fehler bereits für Screenreader beschreibt — doppelt wäre störend. */}
        <div className="nf-code-wrap" aria-hidden="true">
          {/* Linke "4" als einfacher animierter Schriftzug */}
          <span className="nf-digit">4</span>

          {/* Die Null ist als SVG-Grafik umgesetzt — das "gebrochene Ring"-Design:
              Ein Kreis-Umriss mit gestricheltem Strich (CSS-Klasse nf-zero-ring)
              symbolisiert eine unterbrochene Verbindung im Netzwerk.
              In der Mitte sitzt ein Knoten mit einem X — ein ausgefallener Peer. */}
          <div className="nf-zero-wrap">
            <svg viewBox="0 0 80 80" className="nf-zero-svg">
              <defs>
                {/* Farbverlauf von hellem Grau nach Rot: zeigt den "Fehlerzustand"
                    des Rings visuell an — der Knoten ist nicht mehr erreichbar. */}
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   stopColor="#f5f5f7" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.9" />
                </linearGradient>
              </defs>

              {/* Der "gebrochene Ring": ein Kreis-Umriss mit gestricheltem Strich.
                  Das Muster (stroke-dasharray in CSS) erzeugt die optische Lücke,
                  die eine unterbrochene Netzwerkverbindung symbolisiert. */}
              <circle cx="40" cy="40" r="28" className="nf-zero-ring" />

              {/* Toter Knoten in der Ringmitte: der ausgefallene Peer.
                  Der kleine Kreis steht für einen Netzwerkknoten ohne Verbindung. */}
              <circle cx="40" cy="40" r="6" className="nf-zero-dot" />

              {/* Das X über dem Knoten signalisiert: dieser Peer ist nicht erreichbar —
                  zwei diagonale Linien, die sich in der Mitte des Knotens kreuzen. */}
              <line x1="36" y1="36" x2="44" y2="44" className="nf-zero-x" />
              <line x1="44" y1="36" x2="36" y2="44" className="nf-zero-x" />
            </svg>
          </div>

          {/* Rechte "4" — spiegelbildlich zur linken, schließt die 404-Zahl ab */}
          <span className="nf-digit">4</span>
        </div>

        {/* Übersetzter Seitentitel — der erste Text, den ein Screenreader vorliest */}
        <h1 className="nf-title">{tx.title}</h1>

        {/* Zweizeilige Beschreibung; br-desk bricht nur auf Desktop-Breiten um */}
        <p className="nf-sub">
          {tx.sub1}<br className="br-desk" />
          {tx.sub2}
        </p>

        {/* Aktionsbuttons: Zurück zur Startseite oder direkt zum Simulator.
            Die Links enthalten die aktive Sprache in der URL — so bleibt
            die Sprachwahl auch nach der Navigation erhalten. */}
        <div className="nf-actions">
          <Link to={`/${lang}`} className="nf-btn-primary">{tx.backBtn}</Link>
          <Link to={`/${lang}/simulator`} className="nf-btn-ghost">{tx.simBtn}</Link>
        </div>

        {/* Statuszeile am unteren Rand: kleiner animierter Punkt + Statustext,
            der dem Nutzer signalisiert, dass das System noch läuft — nur die Seite fehlt. */}
        <div className="nf-status-row">
          <span className="nf-status-dot" />
          <span className="nf-status-text">{tx.statusText}</span>
        </div>
      </main>
    </div>
  );
}
