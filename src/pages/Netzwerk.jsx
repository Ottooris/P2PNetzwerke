import { useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/Netzwerk.css';
import { useLang } from '../context/LangContext';
import t from '../i18n/translations';

/* ── SVG canvas size ── */
const W = 520, H = 430, CX = 260, CY = 215;

/* ── Node position helpers ── */

/**
 * Berechnet gleichmäßig verteilte Knotenpositionen auf einem Kreis.
 * Startpunkt ist oben (−π/2), damit P1 immer bei 12 Uhr steht.
 * @param {number} n  - Anzahl der Knoten
 * @param {number} r  - Radius des Kreises in SVG-Einheiten
 * @returns {Array}   - Array mit Knotenobjekten { id, x, y, label }
 */
function circleNodes(n, r = 155) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { id: i, x: CX + r * Math.cos(a), y: CY + r * Math.sin(a), label: `P${i + 1}` };
  });
}

/**
 * Erzeugt Knoten für eine Stern-Topologie:
 * Knoten 0 ist der zentrale Server (Mittelpunkt),
 * Knoten 1..n−1 sind die Clients, gleichmäßig auf dem Außenkreis verteilt.
 * @param {number} n - Gesamtanzahl Knoten (1 Server + n−1 Clients)
 * @returns {Array}  - Array mit Knotenobjekten, Server hat isServer: true
 */
function starNodes(n) {
  // id 0 = server at center, id 1..n-1 = clients in circle
  const nodes = [{ id: 0, x: CX, y: CY, label: 'Server', isServer: true }];
  for (let i = 1; i < n; i++) {
    const a = ((i - 1) / (n - 1)) * 2 * Math.PI - Math.PI / 2;
    nodes.push({ id: i, x: CX + 155 * Math.cos(a), y: CY + 155 * Math.sin(a), label: `P${i}` });
  }
  return nodes;
}

/**
 * Verteilt n Knoten gleichmäßig horizontal auf einer Linie (Bus-Topologie).
 * Alle Knoten haben dieselbe Y-Koordinate (Mittellinie des Canvas).
 * @param {number} n - Anzahl der Knoten
 * @returns {Array}  - Array mit Knotenobjekten { id, x, y, label }
 */
function busNodes(n) {
  const step = 420 / (n - 1);
  return Array.from({ length: n }, (_, i) => ({
    id: i, x: Math.round(50 + i * step), y: CY, label: `P${i + 1}`,
  }));
}

// Root(0) → (1,2,3) · 1→(4,5) · 2→(6,7) · 3 = leaf
// Feste Positionen für die Baum-Topologie: 3 Ebenen, manuell ausbalanciert
const TREE_NODES = [
  { id: 0, x: 260, y:  55, label: 'P1', isServer: true },
  { id: 1, x: 100, y: 185, label: 'P2' },
  { id: 2, x: 260, y: 185, label: 'P3' },
  { id: 3, x: 420, y: 185, label: 'P4' },
  { id: 4, x:  42, y: 340, label: 'P5' },
  { id: 5, x: 158, y: 340, label: 'P6' },
  { id: 6, x: 212, y: 340, label: 'P7' },
  { id: 7, x: 308, y: 340, label: 'P8' },
];
const TREE_EDGES = [[0,1],[0,2],[0,3],[1,4],[1,5],[2,6],[2,7]];

/* ── Edge generators ── */
function fullMeshEdges(n) {
  const e = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) e.push([i, j]);
  return e;
}
function partialEdges(n) {
  const seen = new Set(), e = [];
  for (let i = 0; i < n; i++) {
    for (const s of [1, 2]) {
      const j = (i + s) % n;
      const k = `${Math.min(i,j)}-${Math.max(i,j)}`;
      if (!seen.has(k)) { seen.add(k); e.push([i, j]); }
    }
  }
  return e;
}
function ringEdges(n) { return Array.from({ length: n }, (_, i) => [i, (i + 1) % n]); }
function starEdges(n) { return Array.from({ length: n - 1 }, (_, i) => [0, i + 1]); }
function busEdges(n)  { return Array.from({ length: n - 1 }, (_, i) => [i, i + 1]); }

/*
 * TOPO_LAYOUT enthält die sprachunabhängigen Geometrie- und Farbdaten
 * jeder Topologie. Texte (name, sub, badge, info, weakness) werden erst
 * zur Laufzeit aus den Übersetzungen gemergt (siehe TOPOLOGIES weiter unten),
 * damit TOPO_LAYOUT nicht bei jedem Sprach-Wechsel neu erzeugt werden muss.
 */
const TOPO_LAYOUT = [
  { id: 'fullmesh', resilience: 5, color: '#22c55e', nodes: circleNodes(8), edges: fullMeshEdges(8) },
  { id: 'partial',  resilience: 4, color: '#2997ff', nodes: circleNodes(8), edges: partialEdges(8)  },
  { id: 'ring',     resilience: 3, color: '#a78bfa', nodes: circleNodes(8), edges: ringEdges(8)     },
  { id: 'tree',     resilience: 2, color: '#fb923c', nodes: TREE_NODES,     edges: TREE_EDGES       },
  { id: 'bus',      resilience: 2, color: '#fb923c', nodes: busNodes(8),    edges: busEdges(8)      },
  { id: 'star',     resilience: 1, color: '#ef4444', nodes: starNodes(8),   edges: starEdges(8)     },
];

/* ── Connectivity ── */

/**
 * Berechnet die Größe der größten zusammenhängenden Komponente im Graphen
 * unter Berücksichtigung ausgefallener Knoten (dead).
 *
 * Algorithmus: Breitensuche (BFS)
 * 1. Alle lebenden Knoten (alive) werden gesammelt.
 * 2. Für jeden noch nicht besuchten lebenden Knoten wird eine BFS gestartet.
 * 3. Die BFS traversiert nur Kanten, deren beide Endpunkte alive sind.
 * 4. Die größte gefundene Komponente wird zurückgegeben.
 *
 * @param {number[]} allIds - Alle Knoten-IDs des Graphen
 * @param {Array}    edges  - Kantenliste als [[a,b], ...]
 * @param {Set}      dead   - Menge der ausgefallenen Knoten-IDs
 * @returns {number}        - Anzahl Knoten in der größten Komponente
 */
function largestComponent(allIds, edges, dead) {
  const alive = allIds.filter(id => !dead.has(id));
  const adj = Object.fromEntries(alive.map(id => [id, []]));
  edges.forEach(([a, b]) => {
    if (!dead.has(a) && !dead.has(b)) { adj[a].push(b); adj[b].push(a); }
  });
  const visited = new Set();
  let max = 0;
  for (const node of alive) {
    if (visited.has(node)) continue;
    const queue = [node];
    visited.add(node);
    let size = 1;
    while (queue.length) {
      for (const nb of adj[queue.shift()] || []) {
        if (!visited.has(nb)) { visited.add(nb); queue.push(nb); size++; }
      }
    }
    max = Math.max(max, size);
  }
  return max;
}

/* ── Resilience dots ── */

/**
 * Stellt den Resilience-Wert einer Topologie als Reihe von fünf Punkten dar.
 * Aktive Punkte leuchten in der Akzentfarbe der Topologie (inkl. Glow-Effekt),
 * inaktive Punkte bleiben unstyled (grau via CSS).
 * @param {number} value - Resilience-Wert 1–5
 * @param {string} color - CSS-Farbe der aktiven Punkte (Hex)
 */
function ResilienceDots({ value, color }) {
  return (
    <span className="nw-dots">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className="nw-dot-pip"
          style={i < value ? { background: color, boxShadow: `0 0 5px ${color}88` } : {}}
        />
      ))}
    </span>
  );
}

/* ── Component ── */

/**
 * Hauptkomponente der Netzwerk-Seite.
 * Zeigt einen interaktiven Topologie-Simulator, in dem Knoten per Klick
 * als ausgefallen markiert werden können. Die Konnektivität wird live
 * per BFS neu berechnet und im Stats-Panel angezeigt.
 */
export default function Netzwerk() {
  const lang = useLang();
  const s    = t[lang].simulator;

  /*
   * TOPO_LAYOUT (sprachunabhängig) wird mit den übersetzten Texten gemergt.
   * find() sucht das passende Übersetzungsobjekt anhand der ID und der
   * Spread-Operator überschreibt nur die Textfelder – Geometrie bleibt erhalten.
   */
  const TOPOLOGIES = TOPO_LAYOUT.map(layout => {
    const tx = s.topologies.find(x => x.id === layout.id) || {};
    return { ...layout, ...tx };
  });

  const [topoId, setTopoId] = useState('partial');
  const [dead,   setDead]   = useState(new Set());

  const topo    = TOPOLOGIES.find(tp => tp.id === topoId);
  const { nodes, edges } = topo;
  const allIds  = nodes.map(n => n.id);

  /*
   * useMemo verhindert, dass aliveCount und connected bei jedem Render
   * neu berechnet werden. Da largestComponent eine vollständige BFS
   * über den Graphen durchführt, wäre eine Neuberechnung ohne Memoization
   * bei jedem State-Update (z. B. Hover) unnötig teuer.
   * Die Abhängigkeiten [dead, topoId] stellen sicher, dass die Werte
   * genau dann aktualisiert werden, wenn sich der Graph ändert.
   */
  const aliveCount = useMemo(() => allIds.filter(id => !dead.has(id)).length,       [dead, topoId]);
  const connected  = useMemo(() => largestComponent(allIds, edges, dead),            [dead, topoId]);
  const pct        = aliveCount > 0 ? (connected / aliveCount) * 100 : 0;
  const fullyConn  = connected === aliveCount;

  function toggleDead(id) {
    setDead(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function selectTopo(id) { setTopoId(id); setDead(new Set()); }

  function edgeStyle(a, b) {
    if (dead.has(a) || dead.has(b))
      return { stroke: 'rgba(239,68,68,0.3)', strokeDasharray: '4 4' };
    return { stroke: topo.color.replace(')', ',0.28)').replace('rgb(', 'rgba(') + (topo.color.startsWith('#') ? '48' : '') };
  }

  /**
   * Wandelt einen Hex-Farbwert (#rrggbb) in einen rgba()-String um.
   * Wird genutzt, um Kanten- und Knotenfarben mit individueller Deckkraft
   * direkt als SVG-Attribute zu setzen, ohne separate CSS-Klassen zu brauchen.
   * @param {string} hex     - Hex-Farbcode (z. B. '#2997ff')
   * @param {number} opacity - Deckkraft 0–1
   * @returns {string}       - rgba()-CSS-Farbe
   */
  function hexEdge(hex, opacity) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${opacity})`;
  }

  function nodeCls(node) {
    let c = 'nw-node';
    if (node.isServer) c += ' nw-node-special';
    if (dead.has(node.id)) return c + ' nw-node-dead';
    return c + ' nw-node-alive';
  }

  /*
   * Im Full-Mesh werden n*(n−1)/2 Kanten gerendert – bei 8 Knoten sind das 28.
   * Eine niedrigere Deckkraft (0.18) verhindert, dass die vielen überlagernden
   * Linien das Bild überladen. Alle anderen Topologien nutzen 0.32.
   */
  const edgeOpacity = topo.id === 'fullmesh' ? 0.18 : 0.32;

  return (
    <div className="nw-page">
      <Navbar />

      {/* ── Hero ──
          Dekorativer Einstiegsbereich mit animierten Orb-Hintergrundblobs
          (aria-hidden, da rein visuell) sowie Eyebrow-Text, Seitentitel und Untertitel. */}
      <section className="nw-hero">
        <div className="nw-hero-bg" aria-hidden="true">
          <div className="nw-orb nw-orb-1" />
          <div className="nw-orb nw-orb-2" />
        </div>
        <div className="nw-hero-content">
          <p className="nw-eyebrow">{s.eyebrow}</p>
          <h1 className="nw-title">{s.title}</h1>
          <p className="nw-sub">{s.sub}</p>
        </div>
      </section>

      {/* ── Topology selector ──
          Horizontale Scrollleiste mit je einer Karte pro Topologie.
          Die aktive Karte erhält die Klasse „active"; die CSS-Variable
          --topo-color steuert den farbigen Akzent jeder Karte. */}
      <div className="nw-topo-bar">
        <div className="nw-topo-scroll">
          {TOPOLOGIES.map(tp => (
            <button
              key={tp.id}
              className={`nw-topo-card${topoId === tp.id ? ' active' : ''}`}
              style={{ '--topo-color': tp.color }}
              onClick={() => selectTopo(tp.id)}
            >
              <span className="nw-topo-name">{tp.name}</span>
              <span className="nw-topo-sub">{tp.sub}</span>
              <div className="nw-topo-footer">
                <ResilienceDots value={tp.resilience} color={tp.color} />
                <span className="nw-topo-badge" style={{ color: tp.color, borderColor: tp.color + '44', background: tp.color + '14' }}>
                  {tp.badge}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Simulator ──
          Zweispaltiges Layout: links der SVG-Canvas, rechts das Stats-Panel. */}
      <section className="nw-sim-section">
        <div className="nw-sim-wrap">

          {/* ── Canvas ──
              SVG-Rendering des Graphen. Erst werden alle Kanten gezeichnet,
              dann die Knoten (damit Knoten immer über Kanten liegen). */}
          <div className="nw-canvas-box" style={{ '--topo-color': topo.color }}>
            <svg viewBox={`0 0 ${W} ${H}`} className="nw-svg">
              {edges.map(([a, b]) => {
                const na = nodes.find(n => n.id === a);
                const nb = nodes.find(n => n.id === b);
                const broken = dead.has(a) || dead.has(b);
                return (
                  /*
                   * Kanten-Rendering:
                   * – Intakte Kante: durchgezogene Linie in der Topologiefarbe mit
                   *   reduzierter Deckkraft (edgeOpacity), damit der Gesamteindruck
                   *   nicht zu dicht wirkt.
                   * – Unterbrochene Kante (mind. ein Endknoten ausgefallen):
                   *   rote, gestrichelte Linie (rgba(239,68,68,0.3) + strokeDasharray),
                   *   die den Ausfall visuell signalisiert.
                   */
                  <line
                    key={`${a}-${b}`}
                    x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                    className="nw-edge"
                    stroke={broken ? 'rgba(239,68,68,0.3)' : hexEdge(topo.color, edgeOpacity)}
                    strokeDasharray={broken ? '4 4' : undefined}
                    strokeWidth={1.5}
                  />
                );
              })}

              {nodes.map(node => {
                const isDead  = dead.has(node.id);
                const nr      = node.isServer ? 24 : 18;
                /*
                 * Knoten-Rendering (fill / stroke / glow):
                 * – Lebender Knoten: halbtransparente Füllung in der Topologiefarbe
                 *   (Server etwas kräftiger: 0.22 vs. 0.15), farbiger Rand sowie
                 *   ein drop-shadow-Glow-Effekt, der den Knoten „leuchten" lässt.
                 * – Server-Knoten: größerer Radius (24 px statt 18 px) und
                 *   höhere Deckkraft bei Rand (0.95 vs. 0.75) heben ihn hervor.
                 * – Ausgefallener Knoten: nahezu transparente Füllung (0.03),
                 *   roter Rand (rgba(239,68,68,0.55)), kein Glow-Effekt,
                 *   zusätzlich zwei gekreuzte Linien als X-Symbol.
                 */
                const glow    = isDead ? 'none' : `drop-shadow(0 0 7px ${hexEdge(topo.color, 0.55)})`;
                const fill    = isDead ? 'rgba(255,255,255,0.03)' : node.isServer
                  ? hexEdge(topo.color, 0.22) : hexEdge(topo.color, 0.15);
                const stroke  = isDead ? 'rgba(239,68,68,0.55)' : node.isServer
                  ? hexEdge(topo.color, 0.95) : hexEdge(topo.color, 0.75);

                return (
                  <g key={node.id} className={nodeCls(node)} onClick={() => toggleDead(node.id)}>
                    <circle cx={node.x} cy={node.y} r={nr}
                      fill={fill} stroke={stroke} strokeWidth={1.5}
                      style={{ filter: glow, transition: 'all 0.3s' }}
                    />
                    <text x={node.x} y={node.y} className="nw-label"
                      textAnchor="middle" dominantBaseline="middle"
                      style={{ fill: isDead ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.88)' }}
                    >
                      {node.label}
                    </text>
                    {/* X-Symbol über ausgefallenen Knoten als zweite Linienpaar-Schicht */}
                    {isDead && <>
                      <line x1={node.x-6} y1={node.y-6} x2={node.x+6} y2={node.y+6} className="nw-x-line" />
                      <line x1={node.x+6} y1={node.y-6} x2={node.x-6} y2={node.y+6} className="nw-x-line" />
                    </>}
                  </g>
                );
              })}
            </svg>
            <p className="nw-canvas-hint">{s.canvasHint}</p>
          </div>

          {/* ── Stats-Panel ──
              Zeigt Echtzeit-Metriken zur aktuellen Topologie:
              aktive Knotenanzahl, Clustergröße, Konnektivitätsbalken,
              Topologie-Beschreibung, Schwachstelle sowie ein Ergebnis-Verdict
              und einen Reset-Button, sobald Knoten ausgefallen sind. */}
          <div className="nw-panel">
            <div className="nw-panel-header">
              <span className="nw-panel-eyebrow" style={{ color: topo.color }}>{s.liveStatus}</span>
              <h2 className="nw-panel-title">{topo.name}</h2>
              <div className="nw-panel-resilience">
                <ResilienceDots value={topo.resilience} color={topo.color} />
                <span className="nw-panel-badge"
                  style={{ color: topo.color, borderColor: topo.color + '44', background: topo.color + '12' }}>
                  {topo.badge}
                </span>
              </div>
            </div>

            <div className="nw-stat-grid">
              <div className="nw-stat-box">
                <span className="nw-stat-num" style={{ '--n-color': topo.color }}>{aliveCount}</span>
                <span className="nw-stat-desc">{s.activeNodes}</span>
              </div>
              <div className="nw-stat-box">
                {/* Clustergröße: orange wenn nicht alle aktiven Knoten verbunden sind */}
                <span className="nw-stat-num" style={{ '--n-color': fullyConn ? topo.color : '#fb923c' }}>{connected}</span>
                <span className="nw-stat-desc">{s.inCluster}</span>
              </div>
            </div>

            {/* Konnektivitätsbalken: Breite entspricht dem Anteil verbundener Knoten (pct %) */}
            <div className="nw-bar-wrap">
              <div className="nw-bar-track">
                <div className="nw-bar-fill"
                  style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${topo.color}, ${topo.color}99)` }} />
              </div>
              <span className="nw-bar-label">{Math.round(pct)}% {s.connected}</span>
            </div>

            <div className="nw-info-box" style={{ borderColor: topo.color + '22', background: topo.color + '08' }}>
              <p className="nw-info-text">{topo.info}</p>
            </div>

            <div className="nw-weakness-row">
              <span className="nw-weakness-label">{s.weakness}</span>
              <span className="nw-weakness-text">{topo.weakness}</span>
            </div>

            {/* Verdict: erscheint nur wenn mindestens ein Knoten ausgefallen ist */}
            {dead.size > 0 && (
              <div className={`nw-verdict${fullyConn ? ' ok' : ' fail'}`}>
                {fullyConn
                  ? s.verdictOk
                  : `${aliveCount - connected} ${s.verdictFail}`}
              </div>
            )}

            {dead.size > 0 && (
              <button className="nw-reset-btn" onClick={() => setDead(new Set())}>
                {s.reset}
              </button>
            )}

            <div className="nw-legend">
              <div className="nw-legend-row">
                <span className="nw-pip" style={{ background: topo.color, boxShadow: `0 0 5px ${topo.color}88` }} />
                {s.legendActive}
              </div>
              <div className="nw-legend-row">
                <span className="nw-pip" style={{ background: 'rgba(239,68,68,0.7)' }} />
                {s.legendDead}
              </div>
              <div className="nw-legend-row">
                <span className="nw-dash-pip" />
                {s.legendBroken}
              </div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
