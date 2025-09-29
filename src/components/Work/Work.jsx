import React, { useEffect, useMemo, useRef, useState } from 'react';
import Masonry from 'react-responsive-masonry';

import projects from '../../copy/projects.json';
import './Work.scss';

/** Measure an element's content box via ResizeObserver */
function useElementWidth(ref) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cw = entry.contentBoxSize
          ? Array.isArray(entry.contentBoxSize)
            ? entry.contentBoxSize[0].inlineSize
            : entry.contentBoxSize.inlineSize
          : entry.contentRect.width;
        setW(Math.max(0, Math.floor(cw)));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return w;
}

/** Convert a container width into a column count */
function columnsFromWidth(width) {
  if (width <= 0) return 1;
  const target = 360; // ~tile width; tweak as needed
  const cols = Math.max(1, Math.min(4, Math.floor(width / target)));
  return cols;
}

const PROJECTS_INCREMENT = 12;

export default function Work() {
  const data = useMemo(() => [...projects], []);
  const [visibleCount, setVisibleCount] = useState(PROJECTS_INCREMENT);
  const [activeIndex, setActiveIndex] = useState(null);

  const gridRef = useRef(null);
  const width = useElementWidth(gridRef);
  const columns = columnsFromWidth(width);

  const visible = data.slice(0, visibleCount);

  // Lightbox controls
  const openAt = (idx) => setActiveIndex(idx);
  const close = () => setActiveIndex(null);
  const next = () => setActiveIndex((i) => (i == null ? 0 : (i + 1) % data.length));
  const prev = () => setActiveIndex((i) => (i == null ? 0 : (i - 1 + data.length) % data.length));

  useEffect(() => {
    if (activeIndex == null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex]);

  return (
    <div id="Work" className="work-root" aria-labelledby="workTop">
      <h3 id="workTop">Projects & Research</h3>

      {/* The ref makes the grid responsive to its own container */}
      <div ref={gridRef}>
        {/* Force Masonry to recompute layout whenever column count changes */}
        <Masonry key={`cols-${columns}`} columnsCount={columns} gutter="20px">
          {visible.map((p, idx) => (
            <button
              key={p.title}
              className="tile-btn"
              type="button"
              onClick={() => openAt(idx)}
              aria-label={`Open ${p.title}`}
            >
              {/* Tiles are always images/GIFs per your requirement */}
              <div className="tile-media" aria-hidden="true">
                {p.img && <img src={p.img} alt={p.title} loading="lazy" className="tile-img" />}
                {p.img2 && <img src={p.img2} alt="" className="tile-img alt" aria-hidden="true" />}
              </div>
            </button>
          ))}
        </Masonry>
      </div>

      {visibleCount < data.length && (
        <div className="work-footer">
          <button
            type="button"
            className="work-view-more"
            onClick={() => setVisibleCount((c) => c + PROJECTS_INCREMENT)}
            aria-label="Load more projects"
          >
            View more
          </button>
        </div>
      )}

      {activeIndex != null && (
        <Lightbox items={data} index={activeIndex} onClose={close} onNext={next} onPrev={prev} />
      )}
    </div>
  );
}

/** ================= Lightbox ================= */
function Lightbox({ items, index, onClose, onNext, onPrev }) {
  const item = items[index];
  const [videoError, setVideoError] = React.useState(false);
  const hasVideo = Boolean(item.video) && !videoError;

  const onBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="lb-backdrop"
      onMouseDown={onBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      <div className="lb-stage">
        {hasVideo ? (
          <video
            className="lb-video"
            src={item.video}
            poster={item.img || item.img2 || undefined}
            controls
            autoPlay
            muted
            playsInline
            preload="metadata"
            onError={() => setVideoError(true)}
            style={{ maxWidth: '100%', maxHeight: '100%', display: 'block' }}
          />
        ) : (
          item.img && (
            <img
              src={item.img}
              alt={item.title}
              className="lb-img"
              style={{ maxWidth: '100%', maxHeight: '100%', display: 'block' }}
            />
          )
        )}

        <div className="lb-meta">
          <div className="lb-meta-inner">
            <h2 className="lb-title">{item.title}</h2>
            {item.body && <p className="lb-body">{item.body}</p>}
            {item.link && (
              <a className="lb-link" href={item.link} target="_blank" rel="noopener noreferrer">
                Open project
              </a>
            )}
          </div>
        </div>

        <button className="lb-close" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <button className="lb-prev" aria-label="Previous" onClick={onPrev}>
          ‹
        </button>
        <button className="lb-next" aria-label="Next" onClick={onNext}>
          ›
        </button>
      </div>
    </div>
  );
}
