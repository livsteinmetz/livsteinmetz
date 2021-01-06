import React from 'react'
import './Work.scss'
import Project from '../Project/Project'
import projects from '../../copy/projects.json'

export default function Work() {
	return (
		<div id="Work">
			<h3 id="workTop">Work</h3>
			{projects.map(p => (
				<Project
					key={p.title}
					title={p.title}
					img={p.img}
					link={p.link}
					body={p.body}
				/>
			))}
			<div id="Coursework and Tools">
				<h4>Relevant Coursework</h4>
				<p>
					Foundations of Design Thinking, Program & Project Management, Product
					Development, Technical Communications, Technology-Based
					Entrepreneurship, Ethics of Artificial Intelligence, Programming &
					Problem Solving, Applied Behavioral Science, Organizational Behavior,
					Technology Assessment & Forecasting, Program Design & Data Structures,
					Technology Strategy, Systems Engineering, Information Systems,
					Engineering Economy, Blockchain Foundations & Use Cases
				</p>
				<h4>Tools and Technologies</h4>
				<p>
					JavaScript, HTML5, CSS3, React, SQL, Figma, Sketch, Unity, PostgreSQL,
					Node.js Express.js, Java
				</p>
			</div>
		</div>
	)
}
