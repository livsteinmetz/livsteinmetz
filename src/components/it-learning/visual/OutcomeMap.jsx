import React, { useMemo, useState } from 'react';

/**
 * OutcomeMap
 * props:
 *  - outcomes: [
 *      { id, familyKey:'KU'|'CS'|'JA', number:1, title:'Short label', description:'Verbatim outcome' }
 *    ]
 *  - entries:  [
 *      { id, date:'YYYY-MM-DD', title, type, artifactUrl, outcomes:[outcomeId], reflection?, tags? }
 *    ]
 *  - families?: { [key]: { name, color, abbrev } }  // optional override
 *  - height?: number
 */
export default function OutcomeMap({
  outcomes,
  entries,
  families = {
    KU: { name: 'Knowledge & Understanding', color: '#3B82F6', abbrev: 'KU' },
    CS: { name: 'Competence & Skills', color: '#10B981', abbrev: 'CS' },
    JA: { name: 'Judgement & Approach', color: '#F59E0B', abbrev: 'JA' },
  },
  height = 380,
}) {
  const [query, setQuery] = useState('');
  const [activeFamilyKeys, setActiveFamilyKeys] = useState(new Set(Object.keys(families)));
  const [activeOutcomeIds, setActiveOutcomeIds] = useState(new Set());

  // Order columns by family, then outcome.number
  const ordered = useMemo(() => {
    const byFam = {};
    Object.keys(families).forEach((k) => (byFam[k] = []));
    outcomes.forEach((o) => byFam[o.familyKey]?.push(o));
    Object.values(byFam).forEach((arr) => arr.sort((a, b) => (a.number ?? 0) - (b.number ?? 0)));
    return Object.keys(families).flatMap((k) => byFam[k] || []);
  }, [outcomes, families]);

  const idx = useMemo(() => new Map(ordered.map((o, i) => [o.id, i])), [ordered]);

  // Prep entries (sorted by time)
  const parsed = useMemo(() => {
    return entries
      .map((e) => ({ ...e, _t: e.date ? new Date(e.date).getTime() : 0 }))
      .sort((a, b) => a._t - b._t);
  }, [entries]);

  const tMin = parsed.length ? parsed[0]._t : 0;
  const tMax = parsed.length ? parsed[parsed.length - 1]._t : 1;
  const tSpan = Math.max(1, tMax - tMin);

  // Build nodes (one per entry→outcome link)
  const nodes = useMemo(() => {
    const out = [];
    parsed.forEach((e, rowIdx) => {
      const mapped = Array.isArray(e.outcomes) ? e.outcomes : [];
      const strength = Math.max(1, mapped.length);
      const opacity = Math.min(1, 0.45 + 0.15 * strength);
      mapped.forEach((outcomeId) => {
        const o = outcomes.find((x) => x.id === outcomeId);
        if (!o) return;
        out.push({
          id: `${e.id}-${outcomeId}`,
          entry: e,
          outcome: o,
          fam: families[o.familyKey],
          x: idx.get(outcomeId) ?? 0,
          y: tSpan ? (e._t - tMin) / tSpan : rowIdx / Math.max(1, parsed.length - 1),
          opacity,
        });
      });
    });
    return out;
  }, [parsed, outcomes, idx, families, tMin, tSpan]);

  // Search + filters
  const q = query.trim().toLowerCase();
  const matchesQuery = (n) => {
    if (!q) return true;
    const f = n.fam?.name?.toLowerCase() || '';
    const o = `${n.outcome.title} ${n.outcome.description}`.toLowerCase();
    const e =
      `${n.entry.title} ${n.entry.type || ''} ${(n.entry.tags || []).join(' ')}`.toLowerCase();
    return f.includes(q) || o.includes(q) || e.includes(q);
  };
  const matchesFamily = (n) => activeFamilyKeys.has(n.outcome.familyKey);
  const matchesSelected = (n) => activeOutcomeIds.size === 0 || activeOutcomeIds.has(n.outcome.id);
  const filtered = nodes.filter((n) => matchesQuery(n) && matchesFamily(n) && matchesSelected(n));

  // Layout
  const colCount = Math.max(1, ordered.length);
  const width = Math.min(1280, Math.max(760, colCount * 84));
  const pad = 30;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const colW = innerW / colCount;
  const xPos = (x) => pad + colW * (x + 0.5);
  const yPos = (y) => pad + innerH * (1 - y);

  // Counts for chips
  const countsByOutcome = useMemo(() => {
    const m = new Map();
    nodes.forEach((n) => m.set(n.outcome.id, (m.get(n.outcome.id) || 0) + 1));
    return m;
  }, [nodes]);

  const toggleFamily = (key) => {
    setActiveFamilyKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };
  const toggleOutcome = (id) => {
    setActiveOutcomeIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <section aria-label="Outcome map">
      {/* Controls */}
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center' }}
      >
        <input
          aria-label="Search outcomes and artifacts"
          placeholder="Search outcomes or artifact titles…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(0,0,0,.15)' }}
        />
        <div
          role="group"
          aria-label="Filter by outcome family"
          style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
        >
          {Object.entries(families).map(([key, meta]) => {
            const active = activeFamilyKeys.has(key);
            return (
              <button
                key={key}
                onClick={() => toggleFamily(key)}
                aria-pressed={active}
                title={meta.name}
                style={{
                  padding: '8px 10px',
                  borderRadius: 999,
                  border: `1px solid ${meta.color}`,
                  background: active ? meta.color : 'transparent',
                  color: active ? '#fff' : meta.color,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {meta.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Outcome chips with plain-language labels */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
        {ordered.map((o) => {
          const meta = families[o.familyKey];
          const active = activeOutcomeIds.has(o.id);
          const count = countsByOutcome.get(o.id) || 0;
          return (
            <button
              key={o.id}
              onClick={() => toggleOutcome(o.id)}
              aria-pressed={active}
              title={o.description}
              style={{
                padding: '6px 10px',
                borderRadius: 999,
                border: `1px solid ${meta.color}`,
                background: active ? meta.color : 'transparent',
                color: active ? '#fff' : meta.color,
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              {meta.name} {o.number} — {o.title} • {count}
            </button>
          );
        })}
        {activeOutcomeIds.size > 0 && (
          <button
            onClick={() => setActiveOutcomeIds(new Set())}
            aria-label="Clear outcome filters"
            style={{
              padding: '6px 10px',
              borderRadius: 999,
              border: '1px solid rgba(0,0,0,.25)',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Map */}
      <div
        style={{
          overflowX: 'auto',
          border: '1px solid rgba(0,0,0,.08)',
          borderRadius: 12,
          marginTop: 10,
        }}
      >
        <svg
          width={width}
          height={height}
          role="img"
          aria-label="Visual map of artifacts to outcomes"
        >
          {/* Column guides + labels */}
          {ordered.map((o, i) => {
            const meta = families[o.familyKey];
            const x = xPos(i);
            return (
              <g key={`col-${o.id}`}>
                <line
                  x1={x}
                  x2={x}
                  y1={pad - 6}
                  y2={height - pad}
                  stroke={meta.color}
                  strokeOpacity="0.12"
                />
                <text x={x} y={height - 8} fontSize="10" textAnchor="middle" fill="#374151">
                  {meta.name} {o.number}
                </text>
                <text x={x} y={height - 20} fontSize="10" textAnchor="middle" fill="#6B7280">
                  {o.title}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {filtered.map((n) => {
            const cx = xPos(n.x);
            const cy = yPos(n.y);
            return (
              <g key={n.id}>
                <circle cx={cx} cy={cy} r={12} fill={n.fam.color} fillOpacity={n.opacity} />
                <title>
                  {n.entry.title}
                  {'\n'}
                  {n.entry.type || 'Artifact'}
                  {'\n'}Outcome: {n.fam.name} {n.outcome.number} — {n.outcome.title}
                  {'\n'}
                  {n.outcome.description}
                  {'\n'}Date: {n.entry.date}
                </title>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: 'grid', gap: 6, marginTop: 8, fontSize: 12, color: '#374151' }}>
        <div>
          <strong>Color</strong> = Outcome family • <strong>Space</strong> = columns by outcome,
          vertical timeline • <strong>Lightness</strong> = how many outcomes that artifact
          addresses.
        </div>
      </div>
    </section>
  );
}
