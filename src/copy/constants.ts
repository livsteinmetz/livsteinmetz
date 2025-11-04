// data/constants.ts
export const INTERESTS = [
  'Human Computer Interaction',
  'UI/UX Design',
  'Museum Education',
] as const;

export const PROGRAM_OBJECTIVES_GROUPS = [
  {
    heading: 'Knowledge & understanding',
    items: [
      'demonstrate knowledge and understanding in the main field of study, including both broad knowledge of the field and a considerable degree of specialised knowledge in certain areas of the field as well as insight into current research and development work, and',
      'demonstrate specialised methodological knowledge in the main field of study',
    ],
  },
  {
    heading: 'Competence & skills',
    items: [
      'demonstrate the ability to critically and systematically integrate knowledge and analyse, assess and deal with complex phenomena, issues and situations even with limited information',
      'demonstrate the ability to identify and formulate issues critically, autonomously and creatively as well as to plan and, using appropriate methods, undertake advanced tasks within predetermined time frames and so contribute to the formation of knowledge as well as the ability to evaluate this work',
      'demonstrate the ability in speech and writing both nationally and internationally to clearly report and discuss his or her conclusions and the knowledge and arguments on which they are based in dialogue with different audiences, and',
      'demonstrate the skills required for participation in research and development work or autonomous employment in some other qualified capacity.',
      'demonstrate ability to analyse the relationship between the historical development of information technologies and the changing premises for communication and learning',
      'describe and conceptualise how knowledge and learning is organised in institutions, working life and society based on current research and relevant theoretical approaches',
    ],
  },
  {
    heading: 'Judgement & approach',
    items: [
      'demonstrate the ability to make assessments in the main field of study informed by relevant disciplinary, social and ethical issues and also to',
      'demonstrate awareness of ethical aspects of research and development work',
      'demonstrate insight into the possibilities and limitations of research, its role in society and the responsibility of the individual for how it is used, and',
      'demonstrate the ability to identify the personal need for further knowledge and take responsibility for his or her ongoing learning.',
      'critically investigate, analyse and discuss the interaction between users and information technologies in institutions, working life and society',
      'evaluate and adapt the design of digital environments for communication and learning in institutions, working life and society',
    ],
  },
] as const;

export const COURSE_OBJECTIVES_GROUPS = [
  {
    heading: 'Knowledge & understanding',
    items: [
      'account for and compare central perspectives on learning, including both broad knowledge of the field and a considerable degree of specialised knowledge in certain areas of the field as well as insight into current research and development work, and',
      'relate central perspectives on learning to research and practice in the field of IT and Learning',
      'critically analyze and discuss recent research in relation to central perspectives on learning within the field of IT and Learning',
    ],
  },
  {
    heading: 'Competence & skills',
    items: [
      'assemble a selection of research literature in the field of IT and Learning for a defined question or topic',
      'present arguments based on the research literature in the form of an academic paper',
    ],
  },
  {
    heading: 'Judgement & approach',
    items: [
      'reflect on and document their own knowledge and experience in relation to future work life possibilities in a portfolio',
      'discuss social and technical sustainability issues within the research and applied field of IT and learning',
    ],
  },
] as const;

export type ProjectObjective = { label: string; category: string };
export type Project = {
  kind: string;
  title: string;
  summary: string;
  takeaways?: string[];
  tags?: string[];
  objectives?: ProjectObjective[];
  link?: string | null;
};

export const PROJECTS: Project[] = [
  {
    kind: 'LITERATURE REVIEW',
    title: 'Learning to See: Technology as a Medium for Experiential Museum Education',
    summary:
      'This systematic literature review was inspired by my work at the Barnes Foundation developing technology for experiential art learning. The paper investigates how digital mediation reshapes museum education and what it means to "learn to see" in virtual and hybrid contexts. Following the PRISMA framework, I systematically reviewed post-2020 peer-reviewed studies across museum education, human–computer interaction, and learning sciences. The review compares theoretical perspectives—drawing on Dewey’s experiential aesthetics, constructivist learning theories, and research on slow and close looking—to evaluate how digital environments can sustain deep engagement rather than distraction. Findings suggest that technology, when intentionally designed with light scaffolding and affective awareness, can cultivate attention, reflection, and perceptual literacy as learnable skills. The paper concludes that digital tools in museum education should not replicate in-person encounters but create new conditions for learning to see through mediated experience.',
    takeaways: [
      'Learning to see is a cultivable skill in mediated contexts.',
      'Light scaffolding sustains slow/close looking online.',
      'Affective awareness improves depth of engagement.',
    ],
    tags: ['Research & Reflection', 'Learning Design', 'HCI'],
    objectives: [
      {
        label: 'demonstrate specialised methodological knowledge in the main field of study',
        category: 'Knowledge & understanding',
      },
      {
        label:
          'demonstrate the ability to critically and systematically integrate knowledge and analyse, assess and deal with complex phenomena, issues and situations even with limited information',
        category: 'Competence & skills',
      },
      {
        label:
          'critically investigate, analyse and discuss the interaction between users and information technologies in institutions, working life and society',
        category: 'Local outcomes — Judgement & approach',
      },
    ],
    link: null,
  },

  {
    kind: 'DIGITAL PORTFOLIO',
    title: 'Digital Portfolio: Reflective CRUD App',
    summary:
      'This portfolio site itself was developed as part of the PDA675 Digital Portfolio assignment. It serves as a living artifact that documents and reflects on my learning across the programme. Rather than using a static platform, I built a lightweight CRUD (Create, Read, Update, Delete) web app using React, TypeScript, and Firebase. The project demonstrates how digital portfolios can act as both an assessment and a metacognitive learning tool—aligning reflections to course and programme objectives through structured tagging and versioning. The UI dynamically renders reflections from a JSON source (or Firestore), allowing for iterative updates without redeploying. The design emphasizes accessibility, simplicity, and reflection as a design principle: technology as medium for metacognition.',
    takeaways: [
      'A digital portfolio can function as both artifact and process.',
      'Reflection tagging operationalizes learning outcomes in real time.',
      'Building the tool became an exercise in learning design.',
    ],
    tags: ['Web Development', 'Reflective Practice', 'Learning Technology'],
    objectives: [
      {
        label:
          'reflect on and document their own knowledge and experience in relation to future work life possibilities in a portfolio',
        category: 'Judgement & approach',
      },
      {
        label:
          'discuss social and technical sustainability issues within the research and applied field of IT and learning',
        category: 'Judgement & approach',
      },
      {
        label:
          'demonstrate the ability to identify the personal need for further knowledge and take responsibility for ongoing learning',
        category: 'Judgement & approach',
      },
    ],
    link: 'https://livsteinmetz.github.io/',
  },
];

/* -------------------------
   Hard-coded reflections
------------------------- */

export type ReflectionItem = {
  id: string;
  title: string;
  type: 'Reading' | 'Assignment' | 'Group work';
  /** CSV of selected learning objective labels (matches items[] strings above) */
  tags: string;
  summary: string;
  reflection: string;
};

export const REFLECTIONS: ReflectionItem[] = [
  {
    id: 'seed-assignment-1',
    title: 'Learning to See: Systematic Literature Review (PRISMA)',
    type: 'Assignment',
    tags: [
      'relate central perspectives on learning to research and practice in the field of IT and Learning',
      'present arguments based on the research literature in the form of an academic paper',
      'demonstrate specialised methodological knowledge in the main field of study',
      'critically investigate, analyse and discuss the interaction between users and information technologies in institutions, working life and society',
    ].join(','),
    summary:
      'Systematic review of technology-mediated slow/close looking in museum education post-2020; explores how digital environments sustain perceptual learning.',
    reflection:
      'I chose this topic to connect my museum work with the learning theories I’m studying now. Reading adjacent studies sharpened my sense of what my past projects actually supported. My takeaway: “learning to see” can be cultivated online with light scaffolding and affect-aware design—digital should create new conditions for engagement rather than imitate the gallery one-to-one.',
  },

  {
    id: 'seed-assignment-portfolio-project',
    title: 'Digital Portfolio: CRUD App as Reflective Practice',
    type: 'Assignment',
    tags: [
      'reflect on and document their own knowledge and experience in relation to future work life possibilities in a portfolio',
      'discuss social and technical sustainability issues within the research and applied field of IT and learning',
      'demonstrate the ability to identify the personal need for further knowledge and take responsibility for his or her ongoing learning.',
    ].join(','),
    summary:
      'Refactored this site into a CRUD app to log reflections with objective-aligned tags; treating the site itself as a learning tool.',
    reflection:
      'I split academic and professional work and added objective-based tagging. The submission form became a metacognitive checkpoint. The portfolio now works as assessment-for-learning: iterate, reflect, align, repeat.',
  },
  {
    id: 'seed-group-presentation-theories',
    title: 'Group Presentations: Comparing Learning Theories',
    type: 'Group work',
    tags: [
      'account for and compare central perspectives on learning, including both broad knowledge of the field and a considerable degree of specialised knowledge in certain areas of the field as well as insight into current research and development work, and',
      'assemble a selection of research literature in the field of IT and Learning for a defined question or topic',
    ].join(','),
    summary:
      'Collaborative seminar contrasting behaviorism, cognitivism, and constructivism; mapped implications to instructional and learning-experience design.',
    reflection:
      'Dialogue surfaced the affordances and limits of each theory. The exercise itself modeled constructivist learning—knowledge built through discussion, iteration, and application.',
  },

  {
    id: 'seed-reading-skinner-1968',
    title: 'Skinner (1968): The Technology of Teaching',
    type: 'Reading',
    tags: [
      'account for and compare central perspectives on learning, including both broad knowledge of the field and a considerable degree of specialised knowledge in certain areas of the field as well as insight into current research and development work, and',
      'relate central perspectives on learning to research and practice in the field of IT and Learning',
    ].join(','),
    summary:
      'Behaviorist design principles—sequencing, immediate feedback, and reinforcement—applied to teaching machines and instructional design.',
    reflection:
      'This felt foundational. Skinner’s logic still shows up in today’s adaptive systems: small steps, tight feedback loops, visible progress. Even if mechanistic at times, his insistence that technology augments rather than replaces teachers remains a useful design constraint.',
  },

  {
    id: 'seed-reading-papert-1980',
    title: 'Papert (1980): Mindstorms — Children, Computers, and Powerful Ideas',
    type: 'Reading',
    tags: [
      'account for and compare central perspectives on learning, including both broad knowledge of the field and a considerable degree of specialised knowledge in certain areas of the field as well as insight into current research and development work, and',
      'relate central perspectives on learning to research and practice in the field of IT and Learning',
    ].join(','),
    summary:
      'Constructionism extends constructivism: learning through making, with computers as “objects-to-think-with” and microworlds for exploration.',
    reflection:
      'Papert reframed tech as a medium for thinking, not delivery. I read beyond the assignment because the ideas still feel alive in contemporary tools. I’ll keep returning to this as I design activities that let learners build and reason through artifacts.',
  },

  {
    id: 'seed-reading-lave-wenger-1991',
    title: 'Lave & Wenger (1991): Situated Learning — Legitimate Peripheral Participation',
    type: 'Reading',
    tags: [
      'account for and compare central perspectives on learning, including both broad knowledge of the field and a considerable degree of specialised knowledge in certain areas of the field as well as insight into current research and development work, and',
      'relate central perspectives on learning to research and practice in the field of IT and Learning',
    ].join(','),
    summary:
      'Learning as participation in communities of practice; emphasis on identity, context, and gradual movement from periphery to fuller participation.',
    reflection:
      'This helped me see museum education as participation rather than acquisition. Entries on my site can act as steps from peripheral awareness toward fuller scholarly practice. I want to apply this lens more deliberately to future activities.',
  },

  {
    id: 'seed-reading-1',
    title: 'Ertmer & Newby (2013): Behaviorism, Cognitivism, Constructivism',
    type: 'Reading',
    tags: [
      'account for and compare central perspectives on learning, including both broad knowledge of the field and a considerable degree of specialised knowledge in certain areas of the field as well as insight into current research and development work, and',
      'relate central perspectives on learning to research and practice in the field of IT and Learning',
    ].join(','),
    summary:
      'Comparison of three foundational learning theories from an instructional design lens, focusing on when and how each is appropriate.',
    reflection:
      'In professional practice I rarely named a lens, even though I was using one. This piece clarified the “fit for purpose” mindset: choose the theory based on the learning problem and constraints. Going forward I’ll state the lens up front so strategy and evaluation criteria are transparent.',
  },

  {
    id: 'seed-reading-collins-stockton-2018',
    title: 'Collins & Stockton (2018): The Central Role of Theory in Qualitative Research',
    type: 'Reading',
    tags: [
      'critically analyze and discuss recent research in relation to central perspectives on learning within the field of IT and Learning',
      'demonstrate the ability to identify and formulate issues critically, autonomously and creatively as well as to plan and, using appropriate methods, undertake advanced tasks within predetermined time frames and so contribute to the formation of knowledge as well as the ability to evaluate this work',
    ].join(','),
    summary:
      'Argues that theory structures nearly every aspect of qualitative work and offers tools to calibrate theory–method balance.',
    reflection:
      'On the first read this felt abstract; in study group it clicked. I realized I already carry theoretical commitments from lived experience. Big shift: theory isn’t an add-on—it scaffolds questions, coding, and interpretation. I’m now naming lenses explicitly in my reflections and designs.',
  },

  {
    id: 'seed-reading-selwyn-2022',
    title: 'Selwyn (2022): Technology and Learning (Chapter 4)',
    type: 'Reading',
    tags: [
      'critically analyze and discuss recent research in relation to central perspectives on learning within the field of IT and Learning',
      'relate central perspectives on learning to research and practice in the field of IT and Learning',
      'demonstrate insight into the possibilities and limitations of research, its role in society and the responsibility of the individual for how it is used, and',
    ].join(','),
    summary:
      'Synthesizes how digital tech aligns with behaviorist, cognitivist, constructivist, constructionist, and sociocultural theories; highlights design implications.',
    reflection:
      'Selwyn connected the dots—from Skinner’s programmed instruction to Papert’s microworlds to sociocultural participation online. Theories don’t replace one another; they accrete and redirect design choices. I noted the affordances he outlines and have been cross-checking them with interviews and podcasts to keep the ideas grounded.',
  },
];
