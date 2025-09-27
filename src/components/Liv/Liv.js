import React, { useEffect, useRef } from 'react';

import './Liv.scss';
import Work from '../Work/Work';

export default function Liv() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      particles.push({
        x: e.clientX,
        y: e.clientY,
        alpha: 1.0,
        size: Math.random() * 6 + 2,
        hue: Math.random() * 360,
      });
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('mousemove', handleMouseMove);

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.fillStyle = `hsla(${p.hue}, 100%, 50%, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        p.alpha -= 0.02;
        p.size *= 0.96;
        if (p.alpha <= 0) {
          particles.splice(i, 1);
          i--;
        }
      }
      requestAnimationFrame(animate);
    }

    animate();

    // Clean up on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  return (
    <div id="container">
      <div id="left-container">
        <div id="left-scroll">
          <h3>
            I&apos;m interested in how technology might carry more than utility—how it can hold
            memory, friction, joy, and a working sense of justice.
          </h3>
          <br />
          <h5>
            I move between engineering, product design, and fine arts and culture—sometimes all at
            once. I&apos;ve spent the past five years working at the intersection of design,
            technology, and the arts—helping cultural institutions reimagine how they meet people in
            the digital space. My projects have ranged from mobile AR guides that let a gallery
            unfold in new dimensions, to digital learning platforms built to feel less like software
            and more like discovery, to fresh ways of navigating collections online. The throughline
            is less extraction and transaction, more care and connection. Data-driven and
            human-centered, yes—but culturally and ethically attuned, and joyful too!
            <br />
            <br />
            My research focuses on human–computer interaction, AI, and digital culture. What keeps
            me in this space is the same conviction that brought me here in the first place:
            technology, used with care, can expand access and uncover connections. I’m passionate
            about the responsible use of technology to enhance cultural access, foster
            collaboration, and spark creativity—uncovering hidden links in collections, widening
            interpretive possibilities, and shaping museum experiences that feel both engaging and
            equitable. It all started with my background in the arts and technology, studying{' '}
            <a
              className="color"
              href="https://blair.vanderbilt.edu/bass"
              target="_blank"
              rel="noopener noreferrer"
            >
              Double Bass Performance
            </a>{' '}
            and{' '}
            <a
              className="color"
              href="https://engineering.vanderbilt.edu/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Engineering Design
            </a>{' '}
            at Vanderbilt.
          </h5>
          <p>
            I keep circling the same questions: How do we design AI that centers human agency, not
            efficiency alone? What does digital well-being look like when attention itself is an
            economic unit? How can narrative, sound, and interface make learning feel less
            transactional and more like discovery?
            <br />
            <br />
            If you have the same questions (or answers, please!), let&apos;s connect.
          </p>
          <h6>
            My resume lives{' '}
            <a
              href="/OliviaSteinmetzCV2025.pdf"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Olivia Steinmetz resume (PDF)"
            >
              <span className="color">here</span>
            </a>
            .
          </h6>
          <br />
          <section id="work" aria-label="Selected work">
            <Work />
          </section>
          <br />
        </div>
      </div>
      <div id="right-container">
        <div id="right-scroll">
          <h1>Olivia Steinmetz, here.</h1>
          <h2>
            I write code, manage products, play bass, and design interfaces. Some days it feels
            coherent; most days it feels like improvisation. Roots and home base will always be in
            Philadelphia, remote work has me all over the map.
          </h2>
          <h3>[Current Work]</h3>
          <h5 id="right">
            Front-End Software Engineer & Product Manager for Digital Initiatives @{' '}
            <a href="https://barnesfoundation.org/" target="_blank" rel="noopener noreferrer">
              the Barnes Foundation
            </a>
            and (most recently){' '}
            <a href="https://caldergardens.org/" target="_blank" rel="noopener noreferrer">
              Calder Gardens
            </a>
          </h5>
          <h5 id="right">Freelance Double Bassist</h5>
          <br />
          <div>
            <h3>[Former Work + Clients + Collaborators]</h3>

            <h4>Arts + Culture</h4>
            <h5 id="right">
              <a href="https://www.balletwest.org/" target="_blank" rel="noopener noreferrer">
                Ballet West
              </a>
              <br />
              <a href="https://berksopera.org/" target="_blank" rel="noopener noreferrer">
                Berks Opera Company
              </a>
              <br />
              <a href="https://caldergardens.org/" target="_blank" rel="noopener noreferrer">
                Calder Gardens
              </a>
              <br />
              <a href="https://www.curtis.edu/" target="_blank" rel="noopener noreferrer">
                Curtis Institute of Music
              </a>
              <br />
              <a
                href="https://newjerseychamberorchestra.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                New Jersey Chamber Orchestra
              </a>
              <br />
              <a
                href="https://music.sas.upenn.edu/ensembles/penn-symphony-orchestra"
                target="_blank"
                rel="noopener noreferrer"
              >
                Penn Symphony Orchestra
              </a>
              <br />
              <a href="https://pennsylvaniasinfonia.org/" target="_blank" rel="noopener noreferrer">
                Pennsylvania Sinfonia Orchestra
              </a>
              <br />
              <a
                href="https://www.networkfornewmusic.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Philadelphia Network for New Music
              </a>
              <br />
              <a href="https://pyomusic.org/" target="_blank" rel="noopener noreferrer">
                Philadelphia Youth Orchestra
              </a>
              <br />
              <a href="https://settlementmusic.org/" target="_blank" rel="noopener noreferrer">
                Settlement Music School
              </a>
              <br />
              <a href="https://www.symphonyinc.org/" target="_blank" rel="noopener noreferrer">
                Symphony in C
              </a>
              <br />
              <a
                href="https://boyer.temple.edu/academics/ensemble/temple-university-composers-orchestra"
                target="_blank"
                rel="noopener noreferrer"
              >
                Temple Composers Orchestra
              </a>
              <br />
              <a
                href="https://boyer.temple.edu/academics/ensemble/temple-university-symphony-orchestra"
                target="_blank"
                rel="noopener noreferrer"
              >
                Temple University Orchestra
              </a>
              <br />
              <a
                href="https://utahmetropolitanballet.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Utah Metropolitan Ballet
              </a>
              <br />
            </h5>

            <h4>Tech + Nonprofit</h4>
            <h5 id="right">
              Accenture Operations Studio <br />
              <a href="https://alliedmedia.org/" target="_blank" rel="noopener noreferrer">
                Allied Media Projects
              </a>
              <br />
              <a href="https://www.capitalone.com/" target="_blank" rel="noopener noreferrer">
                Capital One
              </a>
              <br />
              <a href="https://designforamerica.com/" target="_blank" rel="noopener noreferrer">
                Design for America
              </a>
              <br />
              <a href="https://designjustice.org/" target="_blank" rel="noopener noreferrer">
                Design Justice Network
              </a>
              <br />
              <a href="https://www.vanderbiltscno.com/" target="_blank" rel="noopener noreferrer">
                Students Consulting for Nonprofit Organizations (SCNO)
              </a>
              <br />
              <a
                href="https://www.vanderbilt.edu/thewondry/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Wond&apos;ry Center for Innovation and Entrepreneurship
              </a>
              <br />
              Project 440 <br />
            </h5>

            <h4>Education + Research</h4>
            <h5 id="right">
              Children&apos;s Hospital of Philadelphia <br />
              Children&apos;s Hospital of Philadelphia Neurovascular Imaging Lab <br />
              <a href="https://www.cnm.org/" target="_blank" rel="noopener noreferrer">
                Nashville Center for Nonprofit Management
              </a>
              <br />
              <a href="https://www.vanderbilt.edu/dive/" target="_blank" rel="noopener noreferrer">
                Design as an Immersive Vanderbilt Experience (DIVE)
              </a>
              <br />
              Planned Parenthood <br />
              Vanderbilt Memory & Alzheimer’s Center <br />
              <a href="https://www.vanderbilt.edu/" target="_blank" rel="noopener noreferrer">
                Vanderbilt University
              </a>
              <br />
              Vanderbilt University Medical Center <br />
              Vanderbilt Programming Board (VPB) Speakers Committee <br />
            </h5>
          </div>
          <br />
          <h3>[Contact]</h3>

          <h5 id="right">
            <a
              href="https://www.linkedin.com/in/livsteinmetz/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </h5>
          <h5 id="right">
            <a href="https://github.com/livsteinmetz" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </h5>
          <h5 id="right">
            <a href="mailto:olivia.r.steinmetz@gmail.com" target="_blank" rel="noopener noreferrer">
              Email
            </a>
          </h5>
          <h5 id="right">
            <a href="/OliviaSteinmetzCV2025.pdf" target="_blank" rel="noopener noreferrer">
              Resume
            </a>
          </h5>
        </div>
      </div>
    </div>
  );
}