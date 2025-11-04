// src/components/admin/ReflectionForm.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../auth';
import { COURSE_OBJECTIVES_GROUPS, PROGRAM_OBJECTIVES_GROUPS } from '../../copy/constants';
import { upsertReflection, deleteReflection } from '../../lib/api';

type Reflection = {
  id?: string;
  title: string;
  citation: string;
  sourceUrl?: string;
  tags: string[]; // array in UI
  theoryLens?: string;
  summary: string;
  reflection: string;
};

// ---------- utilities to prep grouped options ----------
const ALL_GROUPS = [
  ...PROGRAM_OBJECTIVES_GROUPS.map((g) => ({ ...g, prefix: 'Program — ' })),
  ...COURSE_OBJECTIVES_GROUPS.map((g) => ({ ...g, prefix: 'Course — ' })),
];

type GroupedMap = Record<string, string[]>;
const buildGroupedMap = (): GroupedMap =>
  ALL_GROUPS.reduce((acc, g) => {
    const key = `${g.prefix}${g.heading}`;
    acc[key] = g.items.slice();
    return acc;
  }, {} as GroupedMap);

const GROUPED_OBJECTIVES = buildGroupedMap();

function ObjectiveMultiSelect({
  value,
  onChange,
  groupedOptions,
  placeholder = 'Search objectives…',
}: {
  value: string[];
  onChange: (next: string[]) => void;
  groupedOptions: Record<string, string[]>;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groupedOptions;
    const m: Record<string, string[]> = {};
    for (const [group, items] of Object.entries(groupedOptions)) {
      const hits = items.filter((i) => i.toLowerCase().includes(q));
      if (hits.length) m[group] = hits;
    }
    return m;
  }, [groupedOptions, query]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const toggle = (label: string) =>
    onChange(value.includes(label) ? value.filter((v) => v !== label) : [...value, label]);

  const clearAll = () => onChange([]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const first = Object.values(filtered)
        .flat()
        .find((l) => !value.includes(l));
      if (first) {
        onChange([...value, first]);
        setQuery('');
      }
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        display: 'grid',
        gap: 6,
        color: '#222', // ✅ Override text color globally inside component
        fontFamily: 'inherit',
      }}
    >
      <label htmlFor="objective-search" style={{ fontWeight: 600 }}>
        Learning objectives
      </label>

      {/* Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {value.map((v) => (
          <span
            key={v}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 999,
              border: '1px solid #d0d0d0',
              background: '#fafafa',
              fontSize: 12,
              color: '#222', // ensure consistent color for text inside chips
            }}
          >
            {v}
            <button
              type="button"
              onClick={() => toggle(v)}
              aria-label={`Remove ${v}`}
              title="Remove"
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1,
                fontSize: 14,
                color: '#444', // darker for "×"
              }}
            >
              ×
            </button>
          </span>
        ))}
        {value.length === 0 && (
          <span style={{ fontSize: 12, opacity: 0.7 }}>No objectives selected yet.</span>
        )}
      </div>

      {/* Search + dropdown */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            id="objective-search"
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            role="combobox"
            aria-expanded={open}
            aria-controls="objective-listbox"
            aria-autocomplete="list"
            aria-haspopup="listbox"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid #c9c9c9',
              outline: 'none',
              color: '#222', // ✅ input text color
              background: '#fff',
            }}
          />
          <button
            type="button"
            onClick={() => {
              setOpen((o) => !o);
              inputRef.current?.focus();
            }}
            aria-label="Toggle objectives menu"
            style={{
              position: 'absolute',
              right: 6,
              top: '50%',
              transform: 'translateY(-50%)',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: 6,
              color: '#222',
            }}
          >
            ▾
          </button>

          {/* Dropdown */}
          {open && (
            <div
              id="objective-listbox"
              role="listbox"
              style={{
                position: 'absolute',
                zIndex: 10,
                marginTop: 6,
                maxHeight: 280,
                overflow: 'auto',
                width: '100%',
                background: 'white',
                border: '1px solid #e1e1e1',
                borderRadius: 8,
                boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                color: '#222', // ✅ ensure dropdown text stays consistent
              }}
            >
              {Object.keys(filtered).length === 0 && (
                <div style={{ padding: 12, fontSize: 13, opacity: 0.7 }}>No matches</div>
              )}
              {Object.entries(filtered).map(([group, items]) => (
                <div key={group} style={{ padding: '6px 0' }}>
                  <div
                    style={{
                      position: 'sticky',
                      top: 0,
                      background: 'white',
                      padding: '8px 12px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#444', // slightly lighter for group headers
                    }}
                  >
                    {group}
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {items.map((label) => {
                      const checked = value.includes(label);
                      return (
                        <li key={label}>
                          <button
                            type="button"
                            onClick={() => toggle(label)}
                            role="option"
                            aria-selected={checked}
                            style={{
                              display: 'flex',
                              width: '100%',
                              textAlign: 'left',
                              gap: 10,
                              padding: '8px 12px',
                              background: checked ? '#f2f7ff' : 'transparent',
                              border: 'none',
                              borderTop: '1px solid #f3f3f3',
                              cursor: 'pointer',
                              fontSize: 13,
                              color: '#222',
                            }}
                          >
                            <input
                              readOnly
                              type="checkbox"
                              checked={checked}
                              style={{ pointerEvents: 'none' }}
                            />
                            <span>{label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={clearAll}
          disabled={value.length === 0}
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #e1e1e1',
            background: value.length ? '#fff' : '#f7f7f7',
            cursor: value.length ? 'pointer' : 'not-allowed',
            color: '#222', // ✅ consistent button text color
          }}
          title="Clear all selected objectives"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export default function ReflectionForm({
  id,
  initial = {} as Partial<Reflection & { tags?: string | string[] }>,
}: {
  id?: string | null;
  initial?: Partial<Reflection & { tags?: string | string[] }>;
}) {
  const [form, setForm] = useState<Reflection>({
    title: initial.title || '',
    citation: initial.citation || '',
    sourceUrl: initial.sourceUrl || '',
    tags: Array.isArray(initial.tags)
      ? initial.tags
      : (initial.tags ?? '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
    theoryLens: initial.theoryLens || '',
    summary: initial.summary || '',
    reflection: initial.reflection || '',
  });

  const { token } = useAuth();
  const navigate = useNavigate();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      tags: form.tags.join(','),
    } as any;
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
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
      {(['title', 'citation', 'sourceUrl', 'theoryLens', 'summary', 'reflection'] as const).map(
        (key) => (
          <textarea
            key={key}
            name={key}
            placeholder={key}
            value={(form as any)[key] ?? ''}
            onChange={handleTextChange}
            rows={key === 'reflection' ? 10 : 2}
          />
        ),
      )}

      <ObjectiveMultiSelect
        value={form.tags}
        onChange={(tags) => setForm((p) => ({ ...p, tags }))}
        groupedOptions={GROUPED_OBJECTIVES}
      />

      <div style={{ marginTop: 8 }}>
        <button type="button" onClick={() => navigate('/academic-portfolio')}>
          Back
        </button>
        <button type="submit" style={{ marginLeft: 8 }}>
          {id ? 'Save' : 'Create'}
        </button>
        {id && (
          <button type="button" onClick={handleDelete} style={{ marginLeft: 8 }}>
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
