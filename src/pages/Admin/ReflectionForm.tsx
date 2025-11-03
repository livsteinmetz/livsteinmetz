import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../auth';
import { upsertReflection, deleteReflection } from '../../lib/api';

type Reflection = {
  id?: string;
  title: string;
  citation: string;
  sourceUrl?: string;
  tags: string;
  theoryLens?: string;
  summary: string;
  reflection: string;
};

export default function ReflectionForm({
  id,
  initial = {} as Partial<Reflection>,
}: {
  id?: string | null;
  initial?: Partial<Reflection>;
}) {
  const [form, setForm] = useState<Reflection>({
    title: initial.title || '',
    citation: initial.citation || '',
    sourceUrl: initial.sourceUrl || '',
    tags: initial.tags || '',
    theoryLens: initial.theoryLens || '',
    summary: initial.summary || '',
    reflection: initial.reflection || '',
  });
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value } as Reflection);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      tags: form.tags
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .join(','),
    };
    await upsertReflection(token!, id || null, payload);
    navigate('/admin');
  };

  const handleDelete = async () => {
    if (!id) return;
    if (window.confirm('Delete this reflection?')) {
      await deleteReflection(token!, id);
      navigate('/admin');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.5rem' }}>
      {(
        ['title', 'citation', 'sourceUrl', 'tags', 'theoryLens', 'summary', 'reflection'] as const
      ).map((key) => (
        <textarea
          key={key}
          name={key}
          placeholder={key}
          value={(form as any)[key] ?? ''}
          onChange={handleChange}
          rows={key === 'reflection' ? 10 : 2}
        />
      ))}
      <div>
        <button type="button" onClick={() => navigate('/academic-portfolio')}>
          Back
        </button>
        <button type="submit">{id ? 'Save' : 'Create'}</button>
        {id && (
          <button type="button" onClick={handleDelete} style={{ marginLeft: 8 }}>
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
