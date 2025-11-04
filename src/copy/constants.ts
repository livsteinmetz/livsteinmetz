// data/constants.ts
export const INTERESTS = [
  'HCI',
  'interaction design',
  'learning design',
  'museum education',
  'AI + pedagogy',
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
];
