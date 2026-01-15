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

/** Convert a container width into a column count (max 2) */
function columnsFromWidth(width) {
  if (width <= 0) return 1;
  const target = 360; // desired tile width
  const raw = Math.floor(width / target);
  return Math.max(1, Math.min(2, raw));
}

const PROJECTS_INCREMENT = 12;

export default function Work() {
  const data = useMemo(() => [...projects], []);
  const [visibleCount] = useState(PROJECTS_INCREMENT);
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
              <div className="tile-media" aria-hidden="true">
                {p.img && <img src={p.img} alt={p.title} loading="lazy" className="tile-img" />}
                {p.img2 && <img src={p.img2} alt="" className="tile-img alt" aria-hidden="true" />}
              </div>
            </button>
          ))}
        </Masonry>
      </div>
      {/* 
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
      )} */}

      {activeIndex != null && (
        <Lightbox items={data} index={activeIndex} onClose={close} onNext={next} onPrev={prev} />
      )}
    </div>
  );
}

/** ================= Lightbox ================= */
export function Lightbox({ items, index, onClose, onNext, onPrev }) {
  const item = items[index];
  const [videoError, setVideoError] = React.useState(false);
  const hasVideo = Boolean(item.video) && !videoError;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <button
      type="button"
      className="lb-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-label="Close lightbox"
    >
      <div className="lb-stage" role="dialog" aria-modal="true" aria-label={item.title}>
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
          >
            {item.captions && (
              <track kind="captions" src={item.captions} srcLang="en" label="English" default />
            )}
          </video>
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
      </div>

      <div id="content-overlay" className={`overlay overlay--compact`}>
        <div id="inner">
          <h2 className="lb-title">{item.title}</h2>
          {item.body && <p className="lb-body">{item.body}</p>}
          {Array.isArray(item.takeaways) && item.takeaways.length > 0 && (
            <div className="lightbox-takeaways">
              <h6>Takeaways</h6>
              <ul>
                {item.takeaways.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}
          {item.link && (
            <a className="lb-link" href={item.link} target="_blank" rel="noopener noreferrer">
              Learn more
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
    </button>
  );
}
