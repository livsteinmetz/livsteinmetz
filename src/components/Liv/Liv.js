import './Liv.scss'
import Work from '../Work/Work'

export default function Liv() {
  return (
    <div id="container">
      <div id="left-container">
        <div id="left-scroll">
          <h3>I’m working towards the development and adoption of ethical and inclusive technologies for sustainable social impact and innovation.</h3>
          <br></br>
          <h5> My name is Olivia Steinmetz (she, her, hers), but you can
              call me Liv. I'm a recent graduate of Vanderbilt with a dual degree in{' '}
              <span className="color">Double Bass Performance</span> and{' '}
              <span className="color">Engineering Science</span>. As an engineering
              and music student, I focused on the intersection of{' '}
              <span className="color">technology, design, and social justice</span>.
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
              data research & best practices, blockchain for social impact,
              data-driven storytelling, the ethics of artificial intelligence,
              sustainable urban development, and accessible design methodologies (to
              name a few). My goal is to continue to be challenged and immersed in
              work that is holistically human-focused, informed and inspired. I’m a
              quick learner with a diverse background and am always up for a new
              challenge. I thrive when I have the opportunity to wear several
              different hats on fast-moving interdisciplinary teams.
            </p>
            <h6>
              You can find my resume{' '}
              <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
                <span className="color">here</span>
              </a>
              .
			      </h6>
            <br></br>
            <br></br>

            <section id="work">
              <Work />
            </section>
        </div>
      </div>
      <div id="right-container">
        <div id="right-scroll">
          <h1>Hi there!</h1>
          <h2>My name is Liv and I’m a Philadelphia-based software engineer, musician, and UX designer.</h2>
          <h3>[Current Work]</h3>
          <h5>software engineer @ capital one</h5>
          <h5>freelance double bassist</h5>
          <h5>pro bono web developer</h5>
          <br></br>
          <h3>[Former Work + Clients + Collaborators]</h3>
          <h5>Wond'ry Center for Innovation and Entrepreneurship, Allied Media Projects, Nashville Center for Nonprofit Management, Planned Parenthood, Project 615, Accenture Ops Studio, Vanderbilt University Medical Center, Children's Hospital of Philadelphia, Blair School of Music, Vanderbilt Programming Board (VPB) Speakers Committee, Students Consulting for Nonprofit Organizations (SCNO), Design for America, Design as an Immersive Vanderbilt Experience (DIVE) </h5>
        </div>

      </div>

    </div>
  )
}
