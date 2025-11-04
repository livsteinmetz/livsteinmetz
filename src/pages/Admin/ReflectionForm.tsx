// src/components/admin/ReflectionForm.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../auth';
import { COURSE_OBJECTIVES_GROUPS, PROGRAM_OBJECTIVES_GROUPS } from '../../copy/constants';
import { upsertReflection, deleteReflection } from '../../lib/api';

export type Reflection = {
  id?: string; // optional in the form
  title: string;
  type: 'Reading' | 'Paper' | 'Project' | 'Presentation' | ''; // empty until chosen
  tags: string[]; // UI uses an array; saved as CSV on submit
  summary: string;
  reflection: string;
};

/** ---------- quick inline theme ---------- */
const UI = {
  text: '#222',
  subtext: '#555',
  border: '#e2e2e2',
  borderStrong: '#cfcfcf',
  bg: '#fff',
  chipBg: '#fafafa',
  hint: '#777',
  shadow: '0 8px 24px rgba(0,0,0,0.06)',
};

const labelStyle: React.CSSProperties = { fontWeight: 600, color: UI.text, marginBottom: 6 };
const textareaBase: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: `1px solid ${UI.border}`,
  background: UI.bg,
  color: UI.text,
  fontSize: 14,
  resize: 'vertical',
};
const selectBase: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: `1px solid ${UI.border}`,
  background: UI.bg,
  color: UI.text,
  fontSize: 14,
  appearance: 'none',
};
const sectionCard: React.CSSProperties = {
  background: UI.bg,
  border: `1px solid ${UI.border}`,
  padding: 16,
  boxShadow: UI.shadow,
};
const buttonBase: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 10,
  border: `1px solid ${UI.borderStrong}`,
  background: '#fff',
  color: UI.text,
  cursor: 'pointer',
};
const buttonPrimary: React.CSSProperties = {
  ...buttonBase,
  background: '#111',
  color: '#fff',
  border: '1px solid #111',
};

/** ---------- utilities to prep grouped objective options ---------- */
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

/** ---------- small field wrappers ---------- */
function Field({
  name,
  label,
  value,
  onChange,
  rows = 2,
}: {
  name: keyof Omit<Reflection, 'id' | 'tags' | 'type'>;
  label: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={sectionCard}>
      <div style={labelStyle}>{label}</div>
      <textarea
        name={name}
        value={value ?? ''}
        onChange={onChange}
        rows={rows}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        placeholder={label}
        style={{
          ...textareaBase,
          border: focus ? '1px solid #7aa7ff' : textareaBase.border,
          boxShadow: focus ? '0 0 0 3px rgba(122,167,255,0.25)' : 'none',
        }}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  placeholder?: string;
}) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={sectionCard}>
      <div style={labelStyle}>{label}</div>
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={onChange}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          aria-label={label}
          style={{
            ...selectBase,
            border: focus ? '1px solid #7aa7ff' : selectBase.border,
            boxShadow: focus ? '0 0 0 3px rgba(122,167,255,0.25)' : 'none',
          }}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: UI.subtext,
            pointerEvents: 'none',
          }}
        >
          ▾
        </span>
      </div>
    </div>
  );
}

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
    <div ref={containerRef} style={{ ...sectionCard, color: UI.text }}>
      <div style={{ ...labelStyle, marginBottom: 10 }}>Learning objectives</div>

      {/* Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        {value.map((v) => (
          <span
            key={v}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              border: `1px solid ${UI.borderStrong}`,
              background: UI.chipBg,
              fontSize: 12,
              color: UI.text,
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
                fontSize: 16,
                color: UI.subtext,
              }}
            >
              ×
            </button>
          </span>
        ))}
        {value.length === 0 && (
          <span style={{ fontSize: 12, color: UI.hint }}>No objectives selected yet.</span>
        )}
      </div>

      {/* Search + dropdown */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
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
              padding: '12px 14px',
              border: `1px solid ${UI.border}`,
              outline: 'none',
              color: UI.text,
              background: UI.bg,
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
              color: UI.subtext,
              fontSize: 18,
            }}
          >
            ▾
          </button>

          {/* Dropdown */}
          {open && (
            <div
              id="objective-listbox"
              role="listbox"
              tabIndex={-1}
              style={{
                position: 'absolute',
                zIndex: 10,
                marginTop: 8,
                maxHeight: 320,
                overflow: 'auto',
                width: '100%',
                background: '#fff',
                border: `1px solid ${UI.border}`,
                boxShadow: UI.shadow,
                color: UI.text,
              }}
              onMouseDown={(e) => e.preventDefault()} // prevent blur
            >
              {Object.keys(filtered).length === 0 && (
                <div style={{ padding: 12, fontSize: 13, color: UI.hint }}>No matches</div>
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
                      fontWeight: 700,
                      color: UI.subtext,
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
                              padding: '10px 12px',
                              background: checked ? '#f2f7ff' : 'transparent',
                              border: 'none',
                              borderTop: `1px solid ${UI.border}`,
                              cursor: 'pointer',
                              fontSize: 13,
                              color: UI.text,
                            }}
                          >
                            <input
                              readOnly
                              type="checkbox"
                              checked={checked}
                              tabIndex={-1}
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
            ...buttonBase,
            minWidth: 84,
            background: value.length ? '#fff' : '#f4f4f4',
            cursor: value.length ? 'pointer' : 'not-allowed',
          }}
          title="Clear all selected objectives"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

/** ---------- main form ---------- */
const ENTRY_TYPES = ['Reading', 'Paper', 'Project', 'Presentation'] as const;

export default function ReflectionForm({
  id,
  initial = {} as Partial<Reflection & { tags?: string | string[] }>,
}: {
  id?: string | null;
  initial?: Partial<Reflection & { tags?: string | string[] }>;
}) {
  const [form, setForm] = useState<Reflection>({
    title: initial.title || '',
    type: (initial as any).type || '', // show placeholder until user picks
    tags: Array.isArray(initial.tags)
      ? (initial.tags as string[])
      : (initial.tags ?? '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
    summary: (initial as any).summary || '',
    reflection: (initial as any).reflection || '',
  });

  const { token } = useAuth();
  const navigate = useNavigate();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, type: e.target.value as Reflection['type'] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      tags: form.tags.join(','), // CSV for Firestore
      type: form.type,
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
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'grid',
        gap: 14,
        color: UI.text,
        maxWidth: 900,
        margin: '0 auto',
        padding: 16,
      }}
    >
      {/* 1) Title */}
      <Field name="title" label="Title" value={form.title} onChange={handleTextChange} />

      {/* 2) Type (select) */}
      <SelectField
        label="Type"
        value={form.type}
        onChange={handleTypeChange}
        options={[...ENTRY_TYPES]}
        placeholder="Select a type…"
      />

      {/* 3) Learning Objectives */}
      <ObjectiveMultiSelect
        value={form.tags}
        onChange={(tags) => setForm((p) => ({ ...p, tags }))}
        groupedOptions={GROUPED_OBJECTIVES}
      />

      {/* 4) Summary */}
      <Field
        name="summary"
        label="Summary"
        value={form.summary}
        onChange={handleTextChange}
        rows={4}
      />

      {/* 5) Reflection */}
      <Field
        name="reflection"
        label="Reflection"
        value={form.reflection}
        onChange={handleTextChange}
        rows={10}
      />

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button type="button" onClick={() => navigate('/academic-portfolio')} style={buttonBase}>
          ← Back
        </button>
        <div style={{ flex: 1 }} />
        <button type="submit" style={buttonPrimary}>
          {id ? 'Save' : 'Create'}
        </button>
        {id && (
          <button type="button" onClick={handleDelete} style={buttonBase}>
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
