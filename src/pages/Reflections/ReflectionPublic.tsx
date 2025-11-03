// src/pages/Reflections/ReflectionPublic.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { getReflection } from '../../lib/api';

type Reflection = {
  id: string;
  title: string;
  citation: string;
  sourceUrl?: string;
  tags: string;
  theoryLens?: string;
  summary: string;
  reflection: string;
  createdAt: string;
  updatedAt: string;
};

export default function ReflectionPublic() {
  const { id } = useParams<{ id: string }>();
  const [r, setR] = useState<Reflection | null>(null);

  useEffect(() => {
    if (!id) return;
    getReflection(id).then(setR);
  }, [id]);

  if (!r) return <p>Loading...</p>;

  return (
    <article style={{ maxWidth: 700, margin: '2rem auto' }}>
      <a href="/">← Back</a>
      <h1>{r.title}</h1>
      <p>
        <strong>Citation:</strong> {r.citation}
      </p>
      {r.sourceUrl && (
        <p>
          <a href={r.sourceUrl} target="_blank" rel="noreferrer">
            View source
          </a>
        </p>
      )}
      <p>
        <strong>Tags:</strong> {r.tags}
      </p>
      <h3>Summary</h3>
      <p>{r.summary}</p>
      <h3>Reflection</h3>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{r.reflection}</pre>
    </article>
  );
}
