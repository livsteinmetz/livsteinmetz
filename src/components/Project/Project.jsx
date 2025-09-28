// Project.tsx
import './Project.scss';

export default function Project({ title, img, img2, link, body }) {
  const renderMedia = (src) => {
    if (!src) return null;
    const isVideo = /\.(mp4|webm|mov)$/i.test(src);
    return (
      <div className="media">
        {isVideo ? (
          <video autoPlay loop muted playsInline preload="metadata" aria-label={title}>
            <source src={src} />
          </video>
        ) : (
          <img src={src} alt={title} />
        )}
      </div>
    );
  };

  return (
    <div id="Project">
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer">
          <h4>{title}</h4>
        </a>
      ) : (
        <h4>{title}</h4>
      )}

      {renderMedia(img)}
      {renderMedia(img2)}

      <p>{body}</p>
    </div>
  );
}
