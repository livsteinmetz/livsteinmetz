export const INTERESTS = [
  {
    name: 'Human–Computer Interaction (HCI)',
    definition:
      'The study and design of how people engage with digital technologies — integrating computing, design, and social science to understand and improve human experiences with technology.',
    references: ['Ben Shneiderman', 'Kristina Höök', 'Hiroshi Ishii (MIT Media Lab)'],
  },
  {
    name: 'Constructionist Learning Theory',
    definition:
      'A theory of learning through making, introduced by Seymour Papert at MIT, emphasizing that learners build knowledge most effectively by constructing meaningful artifacts and reflecting on their process.',
    references: ['Seymour Papert'],
  },
  {
    name: 'Critical Interface Design',
    definition:
      'An approach that interrogates how interfaces reflect and shape power, identity, and access — asking not just how interfaces work, but whose values they serve.',
    references: ['Sasha Costanza-Chock', 'Anne Marie Piper', 'Phoebe Sengers'],
  },
  {
    name: 'Digital Storytelling and Curation',
    definition:
      'The use of digital media to craft and contextualize narratives — blending art, education, and interaction to help audiences connect with ideas and culture.',
    references: ['Janet Murray', 'Henry Jenkins', 'MIT Open Documentary Lab'],
  },
  {
    name: 'Participatory Design',
    definition:
      'A collaborative design method that values users and communities as co-creators, ensuring that design outcomes reflect their lived experiences and priorities.',
    references: ['Pelle Ehn', 'Shaowen Bardzell', 'Elizabeth Churchill'],
  },
  {
    name: 'Design Justice',
    definition:
      'A framework for equitable design that centers the voices and leadership of those most impacted by design processes. Originated by Sasha Costanza-Chock at MIT, it challenges extractive, exclusionary design practices and promotes community-led creation.',
    references: ['Sasha Costanza-Chock', 'Design Justice Network'],
  },
  {
    name: 'Algorithmic Justice and AI Ethics',
    definition:
      'The study and activism surrounding bias, accountability, and transparency in artificial intelligence. Coined and advanced by Joy Buolamwini and the Algorithmic Justice League at MIT, this work exposes how algorithmic systems reproduce social inequities and seeks more just, inclusive technological futures.',
    references: ['Joy Buolamwini', 'Algorithmic Justice League (MIT Media Lab)'],
  },
  {
    name: 'Data Feminism',
    definition:
      'A feminist approach to data science developed by Catherine D’Ignazio and Lauren Klein that highlights how power and privilege shape data systems — and how intersectional feminism can guide more equitable, ethical data practices.',
    references: ['Catherine D’Ignazio', 'Lauren F. Klein'],
  },

  {
    name: 'Speculative and Critical Design',
    definition:
      'A design practice that uses imagination and provocation to question social, cultural, and ethical assumptions — inviting reflection on alternative technological futures.',
    references: ['Anthony Dunne', 'Fiona Raby', 'Carl DiSalvo'],
  },
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
    link: 'https://drive.google.com/file/d/1JHxXcz8-V0UcsRyc6ImQD7bO0QPDtzeU/view',
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
    link: 'https://livsteinmetz.web.app/',
  },
    {
    "title": "An Analysis of Blockchain for Social Impact Objectives",
    "img": "",
    "img2": "",
    "body": "As an undergraduate researcher, I analyzed blockchain vendors and start-ups for supply chain and social impact applications. I presented a semester-long report on the risks and opportunities of blockchain adoption in nonprofit and procurement contexts, using Microsoft Suite data analytics and market trend forecasting.",
    "link": "https://docs.google.com/presentation/d/1NfYjcmzr6LwwNdaLbAIPokper-k0b8v7AeYCxTPzZWE/edit#slide=id.g35f391192_00",
    "objectives": [
      { "label": "Critically analyse research on learning", "category": "Course" },
      { "label": "Curate research literature for a defined topic", "category": "Course" },
      { "label": "Present academic arguments clearly", "category": "Course" },
      { "label": "Ethical and societal awareness in research", "category": "Program" },
      { "label": "Critical and systematic analysis", "category": "Program" }
    ]
  },
  {
    "title": "Forecast and Assessment of Quantum Computing Viability",
    "img": "",
    "img2": "",
    "body": "As an undergraduate researcher, I conducted scenario-based assessments of quantum computing, combining Delphi forecasting, trend analysis, and monitoring techniques to evaluate the social and technological viability of the field. This work culminated in a report on adoption pathways and barriers for quantum technologies.",
    "link": "/Forecast and Technology Assessment for Quantum Computing Technologies.pdf",
    "objectives": [
      { "label": "Critically analyse research on learning", "category": "Course" },
      { "label": "Present academic arguments clearly", "category": "Course" },
      { "label": "Insight into current research and methods", "category": "Program" },
      { "label": "Critical and systematic analysis", "category": "Program" }
    ]
  },
];

/* -------------------------
   Hard-coded reflections
------------------------- */

export type ReflectionItem = {
  id: string;
  title: string;
  type: 'Reading' | 'Paper' | 'Design';
  course: string;
  /** CSV of selected learning objective labels (matches items[] strings above) */
  tags: string;
  summary: string;
  reflection: string;
};

export const REFLECTIONS: ReflectionItem[] = [
  {
    id: 'seed-assignment-1',
    title: 'Systematic Literature Review',
    type: 'Paper',
    course: 'PDA-675',
    tags: [
      'relate central perspectives on learning to research and practice in the field of IT and Learning',
      'present arguments based on the research literature in the form of an academic paper',
      'demonstrate specialised methodological knowledge in the main field of study',
      'critically investigate, analyse and discuss the interaction between users and information technologies in institutions, working life and society',
    ].join(','),
    summary:
      'Systematic review of technology-mediated slow/close looking in museum education post-2020; explores how digital environments sustain perceptual learning.',
    reflection:
      'I chose this topic to connect my museum work with the learning theories I’m studying now. Conducting a formal literature review helped me move from intuitive design decisions toward a research-informed understanding of perceptual learning online. Reading adjacent studies sharpened my awareness of how digital mediation alters both the pacing and affective quality of engagement. Using the PRISMA framework also strengthened my methodological confidence—especially in managing scope and inclusion criteria. My main conclusion was that “learning to see” is cultivable online with light scaffolding and affect-aware design. Rather than imitating the gallery experience, digital tools should be designed to create new conditions for sustained attention and reflective interpretation.',
  },

  {
    id: 'seed-assignment-portfolio-project',
    title: 'Digital Portfolio',
    type: 'Design',
    course: 'PDA-675',
    tags: [
      'reflect on and document their own knowledge and experience in relation to future work life possibilities in a portfolio',
      'discuss social and technical sustainability issues within the research and applied field of IT and learning',
      'demonstrate the ability to identify the personal need for further knowledge and take responsibility for his or her ongoing learning.',
    ].join(','),
    summary:
      'Refactored this site into a CRUD app to log reflections with objective-aligned tags; treating the site itself as a learning tool.',
    reflection:
      'Developing my digital portfolio as an actual web application made reflection an iterative design process rather than a static submission. I separated academic and professional sections to better represent different forms of expertise, and tagged each reflection with course and programme objectives. This structure turned the submission form into a metacognitive checkpoint: every entry required me to align my work with learning outcomes. Building the system in React, TypeScript, and Firebase was also an exercise in sustainability—designing something modular and reusable beyond the course. The result functions as “assessment for learning”: each iteration helps me see my growth, identify gaps, and consciously connect theory to practice.',
  },
  {
    id: 'reading-norman-doet',
    title: 'Norman (2013): The Design of Everyday Things',
    type: 'Reading',
    course: 'Independent Reading',
    tags: [
      'evaluate and adapt the design of digital environments for communication and learning in institutions, working life and society',
      'demonstrate specialised methodological knowledge in the main field of study',
    ].join(','),
    summary:
      'Reflection on Norman’s principles of human-centered design, focusing on affordances, signifiers, feedback, and error recovery as foundations for intuitive interaction.',
    reflection:
      'Norman’s articulation of affordances and signifiers gave me a stronger vocabulary for diagnosing usability issues in digital environments. His insistence on error-tolerant design resonated with my own product work, especially in complex flows like ticketing, checkout, and membership systems. The reading pushed me to think more deliberately about how interfaces communicate possibilities and constraints. One practical shift I made was paying closer attention to micro-feedback loops—ensuring every action receives a clear, immediate response. The book reinforced that intuitive design is not about simplicity for its own sake but about aligning interfaces with human expectations and reasoning.',
  },
  {
  id: 'reading-lowgren-stolterman-complete',
  title: 'Löwgren & Stolterman (2007): Thoughtful Interaction Design',
  type: 'Reading',
  course: 'TIA132',
  tags: [
    'demonstrate the ability to critically and systematically integrate knowledge and analyse, assess and deal with complex phenomena, issues and situations even with limited information',
    'critically investigate, analyse and discuss the interaction between users and information technologies in institutions, working life and society',
    'demonstrate awareness of ethical aspects of research and development work',
  ].join(','),
  summary:
    'A comprehensive reflection on Löwgren and Stolterman’s argument that interaction design is a value-laden, judgment-driven practice. The book positions design as a dialectical process shaped by ambiguity, ethics, and situated decision-making rather than by linear methods or best practices.',
  reflection:
    'This book clarified several dimensions of design practice that I have experienced intuitively but struggled to articulate. The clearest takeaway is their insistence that design judgment—not methods—is the core of interaction design. They argue that toolkits, processes, and checklists can support the work, but they cannot replace the cultivated ability to make situated, value-laden decisions in complex contexts. This resonates strongly with my own practice, especially when working on institutional systems like ticketing, membership, or learning platforms, where the real work happens in interpreting constraints, balancing competing values, and defending choices that have no obvious “correct” answer.\n\nTheir second major contribution is the claim that design is never neutral. Every system embodies ideological assumptions about people, institutions, behaviors, and desired futures. Reading the book made me more aware of how even small interaction decisions—visibility, flow, control, error recovery—shape participation and access. In my museum work, this feels particularly relevant: the design of digital environments influences who feels addressed, whose knowledge is centered, and how learning and interpretation unfold. Löwgren and Stolterman push this further than I expected by framing design as world-building, with ethical accountability as an inherent part of the job.\n\nA third insight that stayed with me is their distinction between functionality and use-qualities. Functionality describes what a system can do; use-qualities describe what it is like to use. While I understand why they separate the two conceptually, I still find it difficult to operationalize in complex systems where they constantly intertwine. Designing deliberately for qualities like fluency, transparency, or playability is important, but the book offers few concrete heuristics for doing so without reducing the idea to another checklist. This is an area I want to explore further.\n\nTwo ideas were challenging and worth discussing: first, their concept of the “ideal” design process, which prizes openness, reflection, and ongoing reinterpretation. I agree with the spirit, but balancing that openness with the need for structure in production environments remains difficult. Second, their emphasis on philosophical grounding—ontology, epistemology, and ethics—as a foundation for design practice. I understand the claim intellectually, but I am still figuring out how explicit these commitments should be in the rhythm of everyday decision-making.\n\nOverall, the book gave me a stronger conceptual grounding for how I already work: design as the cultivation of judgment, the shaping of opportunities for action rather than control, and the responsibility to recognize that every design decision constructs a particular world. It reinforced the need to be deliberate about values, transparent in reasoning, and aware that ambiguity is not a flaw in the process—it is the medium in which thoughtful interaction design actually operates.',
},
  {
    id: 'reading-design-justice',
    title: 'Costanza-Chock (2020): Design Justice',
    type: 'Reading',
    course: 'Independent Reading',
    tags: [
      'critically investigate, analyse and discuss the interaction between users and information technologies in institutions, working life and society',
      'demonstrate awareness of ethical aspects of research and development work',
    ].join(','),
    summary:
      'A reflection on Design Justice principles—centering marginalized communities, challenging extractive design practices, and prioritizing community-led, liberatory approaches.',
    reflection:
      'Reading Design Justice reframed how I think about power in design work. The framework makes visible the structural inequities that can easily be reproduced through digital tools, interfaces, and data systems. It pushed me to consider who benefits, who is harmed, and who gets to participate in decision-making. I connected this directly to my own work in cultural and public institutions, where design decisions shape access, representation, and interpretation. The text clarified that equitable design is not an aesthetic choice but a governance one, and that meaningful participation must exist throughout a project’s life cycle—not just during user testing.',
  },

  {
    id: 'reading-data-feminism',
    title: 'D’Ignazio & Klein (2020): Data Feminism',
    type: 'Reading',
    course: 'Independent Reading',
    tags: [
      'discuss social and technical sustainability issues within the research and applied field of IT and learning',
      'demonstrate insight into the possibilities and limitations of research and its role in society',
    ].join(','),
    summary:
      'A critical analysis of how power, privilege, and inequality shape data collection, interpretation, and visualization, offering feminist principles for more just data practices.',
    reflection:
      'Data Feminism highlighted that data work is never neutral and that context, embodiment, and lived experience must shape how data is collected, structured, and interpreted. This reading helped me see how data infrastructures can reinforce inequality when underlying assumptions go unquestioned. It influenced how I approach any design that touches data—whether metadata schemas, analytics dashboards, or discovery interfaces. I am now more intentional about asking who is represented, who is missing, and who is allowed to define categories. The book also strengthened my commitment to participatory approaches, particularly when designing systems that influence public understanding or cultural meaning.',
  },

  {
    id: 'seed-reading-skinner-1968',
    title: 'Skinner (1968): The Technology of Teaching',
    type: 'Reading',
    course: 'PDA-675',
    tags: [
      'account for and compare central perspectives on learning, including both broad knowledge of the field and a considerable degree of specialised knowledge in certain areas of the field as well as insight into current research and development work, and',
      'relate central perspectives on learning to research and practice in the field of IT and Learning',
    ].join(','),
    summary:
      'Behaviorist design principles—sequencing, immediate feedback, and reinforcement—applied to teaching machines and instructional design.',
    reflection:
      'Skinner’s principles—small steps, immediate feedback, and visible progress—still underpin most adaptive learning systems today. What struck me most was his framing of technology as an amplifier of teaching rather than a replacement. While behaviorism can feel mechanistic, it highlights the importance of structure and feedback in shaping learning behaviors. Understanding this perspective helps me identify when procedural reinforcement is beneficial and where deeper conceptual engagement is required. It clarified that effective digital learning often depends on balancing automation with human guidance.',
  },

  {
    id: 'seed-reading-papert-1980',
    title: 'Papert (1980): Mindstorms — Children, Computers, and Powerful Ideas',
    type: 'Reading',
    course: 'PDA-675',
    tags: [
      'account for and compare central perspectives on learning, including both broad knowledge of the field and a considerable degree of specialised knowledge in certain areas of the field as well as insight into current research and development work, and',
      'relate central perspectives on learning to research and practice in the field of IT and Learning',
    ].join(','),
    summary:
      'Constructionism extends constructivism: learning through making, with computers as “objects-to-think-with” and microworlds for exploration.',
    reflection:
      'Papert’s idea of computers as “objects-to-think-with” reframed technology for me—not as a channel for content delivery, but as a partner in thought. His notion that learners construct knowledge through creating artifacts resonates strongly with my work in interactive learning environments. Reading Mindstorms reminded me that design should invite exploration and creativity, not just comprehension. I also appreciated Papert’s stance on learner agency—how programming and making can externalize thinking processes and allow learners to debug both code and ideas. This reading continues to influence how I think about designing reflective, learner-driven technologies.',
  },

  {
    id: 'seed-reading-lave-wenger-1991',
    title: 'Lave & Wenger (1991): Situated Learning — Legitimate Peripheral Participation',
    type: 'Reading',
    course: 'PDA-675',
    tags: [
      'account for and compare central perspectives on learning, including both broad knowledge of the field and a considerable degree of specialised knowledge in certain areas of the field as well as insight into current research and development work, and',
      'relate central perspectives on learning to research and practice in the field of IT and Learning',
    ].join(','),
    summary:
      'Learning as participation in communities of practice; emphasis on identity, context, and gradual movement from periphery to fuller participation.',
    reflection:
      'Lave and Wenger’s concept of legitimate peripheral participation helped me reconceptualize museum learning as participation rather than acquisition. This aligns with how visitors and educators co-construct meaning around artworks—each encounter moving from peripheral observation toward more engaged interpretation. Applying this to my own studies, I see each assignment and discussion as steps toward fuller participation in the academic community. It also pushed me to consider how digital tools might scaffold entry points into professional or disciplinary communities online.',
  },

  {
    id: 'seed-reading-1',
    title: 'Ertmer & Newby (2013): Behaviorism, Cognitivism, Constructivism',
    type: 'Reading',
    course: 'PDA-675',
    tags: [
      'account for and compare central perspectives on learning, including both broad knowledge of the field and a considerable degree of specialised knowledge in certain areas of the field as well as insight into current research and development work, and',
      'relate central perspectives on learning to research and practice in the field of IT and Learning',
    ].join(','),
    summary:
      'Comparison of three foundational learning theories from an instructional design lens, focusing on when and how each is appropriate.',
    reflection:
      'Ertmer and Newby helped me explicitly connect design decisions to theoretical frameworks. In professional practice I had been intuitively mixing approaches without naming them. This article clarified when each perspective best fits—behaviorism for skill automation, cognitivism for conceptual organization, and constructivism for open-ended exploration. The most important insight was that theory choice should be driven by the learning problem, not personal preference. I now make it a habit to identify my guiding theory in each project so that instructional strategies remain transparent and grounded.',
  },

  {
    id: 'seed-reading-collins-stockton-2018',
    title: 'Collins & Stockton (2018): The Central Role of Theory in Qualitative Research',
    type: 'Reading',
    course: 'PDA-675',
    tags: [
      'critically analyze and discuss recent research in relation to central perspectives on learning within the field of IT and Learning',
      'demonstrate the ability to identify and formulate issues critically, autonomously and creatively as well as to plan and, using appropriate methods, undertake advanced tasks within predetermined time frames and so contribute to the formation of knowledge as well as the ability to evaluate this work',
    ].join(','),
    summary:
      'Argues that theory structures nearly every aspect of qualitative work and offers tools to calibrate theory–method balance.',
    reflection:
      'When I first read this article, it felt abstract and inaccessible. Discussing it with classmates helped me realize that I already hold implicit theoretical assumptions from my own professional practice. The key shift for me was seeing theory as scaffolding rather than constraint—it structures questions, interpretation, and meaning-making. This realization has changed how I approach both research and design: I now articulate the theoretical stance guiding my choices, acknowledging that it shapes how I see and what I value in the data.',
  },

  {
    id: 'seed-reading-selwyn-2022',
    title: 'Selwyn (2022): Technology and Learning (Chapter 4)',
    type: 'Reading',
    course: 'PDA-675',
    tags: [
      'critically analyze and discuss recent research in relation to central perspectives on learning within the field of IT and Learning',
      'relate central perspectives on learning to research and practice in the field of IT and Learning',
      'demonstrate insight into the possibilities and limitations of research, its role in society and the responsibility of the individual for how it is used, and',
    ].join(','),
    summary:
      'Synthesizes how digital tech aligns with behaviorist, cognitivist, constructivist, constructionist, and sociocultural theories; highlights design implications.',
    reflection:
      'Selwyn’s synthesis was the first time I saw all the theories from this course mapped to digital contexts. His argument that theories accumulate rather than replace one another helped me see the field as iterative and layered. He showed how behaviorist traces persist in adaptive software, how constructivism drives participatory learning, and how sociocultural theory reframes online collaboration. This reading gave me a language for identifying these influences in my own work and in the technologies I design. It also reminded me that theory should inform ethical as well as functional choices in technology-mediated learning.',
  },
];
