import './Liv.scss'
import Work from '../Work/Work'

export default function Liv() {
  return (
    <div id="container">
      <div id="left-container">
        <div id="left-scroll">
          <h3>I’m working towards the development & adoption of ethical & inclusive technologies for sustainable social impact & innovation.</h3>
          <br></br>
          <h5> My name is <span className="color">Olivia Steinmetz (she/her)</span>, but you can
              call me Liv. I'm a Philadelphia-based software engineer, musician, & UX designer. I received my Bachelors degree from Vanderbilt University with majors in {' '}
              <span className="color">Double Bass Performance</span> &{' '}
              <span className="color">Engineering Science</span>. As an engineering
              & music student, I focused on the intersection of{' '}
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
              sustainable urban development, & accessible design methodologies (to
              name a few). My goal is to continue to be challenged & immersed in
              work that is holistically human-focused, informed & inspired. I’m a
              quick learner with a diverse background & am always up for a new
              challenge.
            </p>
            <h6>
              You can find my resume{' '}
              <a href="/Olivia Steinmetz Resume 2021.pdf" target="_blank" rel="noopener noreferrer">
                <span className="color">here</span>
              </a>
              .
			      </h6>
            <br></br>
            <br></br>

            <section id="work">
              <Work />
            </section>

            <br></br>
            <br></br>

            <h5 class="color">
              Please reach out to learn more about my current projects! I'm always happy to chat :)
			      </h5>
        </div>
      </div>
      <div id="right-container">
        <div id="right-scroll">
          <h1>Hi there!</h1>
          <h2>My name is Liv & I’m a Philadelphia-based software engineer, musician, & UX designer.</h2>
          <h3>[Current Work]</h3>
          <h5>software engineer @ capital one</h5>
          <h5>freelance double bassist</h5>
          <h5>pro bono web developer</h5>
          <br></br>
          <h3>[Former Work + Clients + Collaborators]</h3>
          <h5>The Wond'ry Center for Innovation & Entrepreneurship, Accenture Operations Studio, Allied Media Projects, Design Justice Network, Design as an Immersive Vanderbilt Experience (DIVE), Design for America, Planned Parenthood, Vanderbilt University Medical Center, The Children's Hospital of Philadelphia, Vanderbilt Programming Board (VPB) Speakers Committee, Students Consulting for Nonprofit Organizations (SCNO), Nashville Center for Nonprofit Management</h5>
          <br></br>
          <h3>[Contact]</h3>
          <a href="https://www.linkedin.com/in/livsteinmetz/" target='_blank' rel='noopener noreferrer'><h5>LinkedIn</h5></a>
          <a href="https://github.com/livsteinmetz" target='_blank' rel='noopener noreferrer'><h5>Github</h5></a>
          <a href="mailto:olivia.r.steinmetz@gmail.com" target='_blank' rel='noopener noreferrer'><h5>Email</h5></a>
        </div>

      </div>

    </div>
  )
}
