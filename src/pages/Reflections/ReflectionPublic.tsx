// src/pages/Reflections/ReflectionPublic.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getReflection } from '../../lib/api';

// Shape as it comes back from the API/DB (CSV tags)
type ReflectionDoc = {
  id?: string;
  title: string;
  type?: 'Reading' | 'Assignment' | 'Group work' | string;
  tags?: string;
  summary?: string;
  reflection?: string;
};

export default function ReflectionPublic() {
  const { id } = useParams<{ id: string }>();
  const [r, setR] = useState<ReflectionDoc | null>(null);
  const [err, setErr] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await getReflection(id);
        setR(data as ReflectionDoc);
      } catch (e) {
        console.error('[getReflection]', e);
        setErr('Could not load this reflection.');
      }
    })();
  }, [id]);

  const tags = useMemo(
    () =>
      (r?.tags ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    [r?.tags],
  );

  if (err) {
    return (
      <article style={{ maxWidth: 760, margin: '2rem auto', padding: '0 1rem' }}>
        <Link to="/academic-portfolio/#projects" aria-label="Back to portfolio">
          ← Back
        </Link>
        <p style={{ color: '#E57373', marginTop: 12 }}>{err}</p>
      </article>
    );
  }

  if (!r) {
    return (
      <article style={{ maxWidth: 760, margin: '2rem auto', padding: '0 1rem' }}>
        <Link to="/academic-portfolio/#projects" aria-label="Back to portfolio">
          ← Back
        </Link>
        <p style={{ marginTop: 12 }}>Loading…</p>
      </article>
    );
  }

  return (
    <article style={{ maxWidth: 760, margin: '2rem auto', padding: '0 1rem' }}>
      <Link to="/academic-portfolio/#projects" aria-label="Back to portfolio">
        ← Back
      </Link>

      <header style={{ marginTop: 12, marginBottom: 16 }}>
        <h1 style={{ margin: '0 0 8px' }}>{r.title}</h1>
        {r.type && (
          <span
            title={`Type: ${r.type}`}
            style={{
              display: 'inline-block',
              fontSize: 12,
              padding: '2px 8px',
              borderRadius: 999,
              border: '1px solid #ddd',
              background: '#f7f7f7',
              color: '#333',
            }}
          >
            {r.type}
          </span>
        )}
      </header>

      {tags.length > 0 && (
        <section style={{ margin: '12px 0 20px' }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Learning objectives</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {tags.map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 12,
                  padding: '6px 10px',
                  borderRadius: 999,
                  border: '1px solid #e0e0e0',
                  background: '#fafafa',
                  color: '#222',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </section>
      )}

      {r.summary && (
        <section style={{ marginBottom: 24 }}>
          <h3 style={{ margin: '16px 0 8px' }}>Summary</h3>
          <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{r.summary}</p>
        </section>
      )}

      {r.reflection && (
        <section>
          <h3 style={{ margin: '16px 0 8px' }}>Reflection</h3>
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>
            {r.reflection}
          </pre>
        </section>
      )}
    </article>
  );
}
