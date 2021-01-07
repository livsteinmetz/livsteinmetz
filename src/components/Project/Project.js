import './Project.scss'

export default function Project({ title, img, link, body }) {
	return (
		<div id="Project">
			<a href={link} target="_blank" rel="noopener noreferrer">
				<h4>{title}</h4>			
			</a>
			{ img ? <img src={img} alt={title} /> : null}
			<p>{body}</p>
		</div>
	)
}
