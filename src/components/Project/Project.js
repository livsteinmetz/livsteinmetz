import "./Project.scss";

export default function Project({ title, img, img2, link, body }) {
  return (
    <div id="Project">
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer">
          <h4>{title}</h4>
        </a>
      ) : (
        <h4>{title}</h4>
      )}
      {img ? <img src={img} alt={title} /> : null}
      {img2 ? <img src={img2} alt={title} /> : null}
      <p>{body}</p>
    </div>
  );
}
