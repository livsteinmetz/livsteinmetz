import React from 'react';
import './Project.scss';

/**
 * Usage:
 * <Project
 *   title="Example"
 *   img="/preview.gif"      // shown if no video OR used as poster
 *   img2="/alt.jpg"         // optional secondary still
 *   video="/clip.mp4"       // optional; detail card will render a <video>
 *   link="https://example.com"
 *   body="Description…"
 *   compact={false}
 * />
 *
 * Notes:
 * - Keeps your existing image box-shadow (CSS targets img only).
 * - Video intentionally has no shadow, per your request.
 */
export default function Project({ title, img, img2, video, link, body, compact = false }) {
  const Wrapper = ({ children }) =>
    link ? (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={compact ? 'project-link compact' : 'project-link'}
        aria-label={`Open ${title}`}
      >
        {children}
      </a>
    ) : (
      <div className={compact ? 'project-card compact' : 'project-card'}>{children}</div>
    );

  return (
    <div id="Project" className={compact ? 'project compact' : 'project'}>
      <Wrapper>
        <h4 className="project-title">{title}</h4>

        {(img || img2 || video) && (
          <div className="project-media">
            {video ? (
              /* eslint-disable-next-line jsx-a11y/media-has-caption */
              <video
                className="project-video"
                src={video}
                poster={img || img2 || undefined}
                controls
                playsInline
                preload="metadata"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            ) : (
              <>
                {img && <img src={img} alt={title} loading="lazy" className="project-img" />}
                {img2 && <img src={img2} alt={title} loading="lazy" className="project-img" />}
              </>
            )}
          </div>
        )}

        {!compact && body ? <p className="project-body">{body}</p> : null}
      </Wrapper>
    </div>
  );
}
