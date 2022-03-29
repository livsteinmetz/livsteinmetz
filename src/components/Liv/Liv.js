import './Liv.scss'

import Work from '../Work/Work'

export default function Liv() {
  return (
    <div id="container">
      <div id="left-container">
        <div id="left-scroll">
          <h3>I’m working towards the development and adoption of equitable and educational technologies for sustainable social impact and innovation.</h3>
          <br></br>
          <h5> My name is <span className="color">Olivia Steinmetz (she/her)</span>, but you can
              call me Liv. I'm a Philadelphia-based software engineer, musician, and UI designer. I'm currently working at the<a className="color" href="https://barnesfoundation.org/" target='_blank' rel='noopener noreferrer'> Barnes Foundation</a> as a Front End Software Engineer. I earned my Bachelor's degree from Vanderbilt University with majors in {' '}
              <span className="color">Double Bass Performance</span> and{' '}
              <span className="color">Engineering Design</span>. As an engineering
              and music student, I focused on the intersection of{' '}
              <span className="color">tech, design and culture.</span>.
              I’m committed to action and change, seeking out any and every
              opportunity to expand my knowledge in{' '}
              <span className="color">
                human-centered design thinking methodologies
              </span>{' '}
              informed by
              <span className="color">
                {' '}
                intersectional feminist design principles
              </span>
              .
            </h5>
            <p>
           I have completed research projects, coursework, and hackathons on user
              data research and best practices, blockchain for social impact,
              data-driven storytelling, the ethics of artificial intelligence,
              sustainable urban development, and accessible design methodologies (to
              name a few). My goal is to continue to be challenged and immersed in
              work that is holistically human-focused, informed and inspired. I’m a
              quick learner with a diverse background and am always up for a new
              challenge.
            </p>
            {/* <h6>
              You can find my resume{' '}
              <a href="/OliviaSteinmetzResume2021.pdf" target="_blank" rel="noopener noreferrer">
                <span className="color">here</span>
              </a>
              .
			      </h6> */}
            <br></br>
            <br></br>

            <section id="work">
              <Work />
            </section>

            <br></br>
            <br></br>

            <h5 class="color">
              Interested in working together? Want to learn more about my current projects? Please reach out! I'm always happy to chat :)
			      </h5>
        </div>
      </div>
      <div id="right-container">
        <div id="right-scroll">
          <h1>Hi there!</h1>
          <h2>My name is Liv and I’m a Philadelphia-based software engineer, musician, and UI designer.</h2>
          <h3>[Current Work]</h3>
          <h5 id="right">front end engineer @ <a href="https://barnesfoundation.org/" target='_blank' rel='noopener noreferrer'>the Barnes</a></h5>
          <h5 id="right">double bassist</h5>
          <h5 id="right">pro bono web developer</h5>
          <br></br>
          <h3>[Former Work + Clients + Collaborators]</h3>
          <h5 id="right"><a href="https://www.vanderbilt.edu/thewondry/" target='_blank' rel='noopener noreferrer'>The Wond'ry Center for Innovation and Entrepreneurship</a>, <a href="https://studios.accenture.com/" target='_blank' rel='noopener noreferrer'>Accenture Operations Studio</a>, <a href="https://alliedmedia.org/" target='_blank' rel='noopener noreferrer'>Allied Media Projects</a>, <a href="https://designjustice.org/" target='_blank' rel='noopener noreferrer'>Design Justice Network</a>, <a href="https://www.vanderbilt.edu/dive/" target='_blank' rel='noopener noreferrer'>Design as an Immersive Vanderbilt Experience (DIVE)</a>, <a href="https://designforamerica.com/" target='_blank' rel='noopener noreferrer'>Design for America</a>, Planned Parenthood, Vanderbilt University Medical Center, The Children's Hospital of Philadelphia, Vanderbilt Programming Board (VPB) Speakers Committee, <a href="https://www.vanderbiltscno.com/" target='_blank' rel='noopener noreferrer'>Students Consulting for Nonprofit Organizations (SCNO)</a>, <a href="https://www.cnm.org/" target='_blank' rel='noopener noreferrer'>Nashville Center for Nonprofit Management</a></h5>
          <br></br>
          <h3>[Contact]</h3>
          <h5 id="right"><a href="https://www.linkedin.com/in/livsteinmetz/" target='_blank' rel='noopener noreferrer'>LinkedIn</a></h5>
          <h5 id="right"><a href="https://github.com/livsteinmetz" target='_blank' rel='noopener noreferrer'>Github</a></h5>
          <h5 id="right"><a href="mailto:olivia.r.steinmetz@gmail.com" target='_blank' rel='noopener noreferrer'>Email</a></h5>
          <h5 id="right"><a href="/OliviaSteinmetzResume2021.pdf" target="_blank" rel="noopener noreferrer">Resume</a></h5>
        </div>

      </div>

    </div>
  )
}
