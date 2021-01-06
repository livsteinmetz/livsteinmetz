import './Project.scss'

export default function Project({ title, img, link, body }) {
	return (
		<div id="Project">
			<h4>{title}</h4>
			<a href={link} target="_blank" rel="noopener noreferrer">
			</a>
			<p>{body}</p>
		</div>
	)
}
