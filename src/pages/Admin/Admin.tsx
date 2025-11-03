import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../auth';
import { listReflections } from '../../lib/api';

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

export default function Admin() {
  const [items, setItems] = useState<Reflection[]>([]);
  const { logout } = useAuth();

  useEffect(() => {
    listReflections().then(setItems);
  }, []);

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Reflections</h1>
        <div>
          <Link to="/admin/new">New</Link> <button onClick={logout}>Sign out</button>
        </div>
      </div>
      <ul>
        {items.map((r) => (
          <li key={r.id}>
            <Link to={`/admin/edit/${r.id}`}>{r.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
