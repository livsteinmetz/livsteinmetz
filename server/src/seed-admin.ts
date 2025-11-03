import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // --- ensure an admin user exists ---
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'password123';
  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passHash: hashed,
    },
  });

  console.log(`Seeded admin user: ${email}`);

  const READINGS = [
    {
      title: 'Mindstorms: Children, Computers, and Powerful Ideas (2nd ed.)',
      citation: 'Papert, S. (1980/1993). New York: Basic Books. Chs: Foreword, Intro, 1–6, 8.',
      sourceUrl: '#',
      tags: 'Constructionism, Learning by making',
      summary:
        'Explores how computers can serve as “objects-to-think-with,” enabling learners to construct and reflect on knowledge through making and exploration.',
      reflection:
        'Papert’s ideas around constructionism challenge me to design digital learning environments that foster agency and tangible creation. I want to think about what “objects-to-think-with” could look like for adult museum learners.',
    },
    {
      title: 'The Technology of Teaching',
      citation: 'Skinner, B. F. (1968). New York: Appleton-Century-Crofts.',
      sourceUrl: '#',
      tags: 'Behaviorism, Programmed instruction',
      summary:
        'Presents Skinner’s approach to instructional design through immediate feedback, reinforcement, and controlled sequencing of learning tasks.',
      reflection:
        'I’m curious how aspects of Skinner’s teaching machines could inform adaptive feedback loops in modern digital museum tools—balancing guidance without over-structuring exploration.',
    },
    {
      title: 'The central role of theory in qualitative research',
      citation:
        'Collins, C. S., & Stockton, C. M. (2018). International Journal of Qualitative Methods, 17(1).',
      sourceUrl: 'https://doi.org/10.1177/160940691879747',
      tags: 'Theoretical frameworks, Qualitative methods',
      summary:
        'Argues that theoretical frameworks are not add-ons but integral to research design, shaping every phase of qualitative inquiry.',
      reflection:
        'This helps me reflect on which theoretical “coat” I’m wearing in my own work—where Dewey’s experiential framework sits and where I might be over-relying on it.',
    },
    {
      title:
        'Behaviorism, cognitivism, constructivism: Comparing critical features from an instructional design perspective',
      citation:
        'Ertmer, P. A., & Newby, T. J. (2013). Performance Improvement Quarterly, 26(2), 43–71.',
      sourceUrl: 'https://onlinelibrary.wiley.com/doi/10.1002/piq.21143',
      tags: 'ID theory, Comparative lenses',
      summary:
        'Compares three major learning theories to guide instructional designers in selecting appropriate strategies for different learning goals.',
      reflection:
        'Mapping design decisions through these lenses reminds me to make theoretical rationales explicit when designing museum-based digital experiences.',
    },
    {
      title: 'The digital portfolio as an assessment strategy for learning in higher education',
      citation:
        'Marinho, P., Fernandes, P., & Pimentel, F. (2021). Distance Education, 42(2), 253–267.',
      sourceUrl: 'https://doi.org/10.1080/01587919.2021.1911628',
      tags: 'Assessment for learning, ePortfolios',
      summary:
        'Explores digital portfolios as formative assessment tools that integrate reflection, feedback, and evidence of learning.',
      reflection:
        'This aligns with my interest in reflection as part of learning design—especially how digital portfolios might scaffold awareness and self-assessment for adult learners.',
    },
    {
      title: 'Education and Technology: Key Issues and Debates (3rd ed.), Chapter 4: Technology and Learning',
      citation: 'Selwyn, N. (2022). Bloomsbury Academic (e-book).',
      sourceUrl:
        'https://gu-se-primo.hosted.exlibrisgroup.com/permalink/f/rmbr1s/46GUB_KOHA2772160',
      tags: 'EdTech debates, Theory ↔ design',
      summary:
        'A critical overview of how learning technologies reflect societal, political, and pedagogical assumptions.',
      reflection:
        'Selwyn’s framing grounds my enthusiasm for technology with a healthy skepticism—reminding me to examine who benefits and whose assumptions are built into design.',
    },
    {
      title: 'Situated Learning: Legitimate Peripheral Participation',
      citation: 'Lave, J., & Wenger, E. (1991). Cambridge University Press.',
      sourceUrl: '#',
      tags: 'Sociocultural, Communities of practice',
      summary:
        'Introduces learning as participation in social practice rather than the acquisition of knowledge.',
      reflection:
        'This reminds me to design opportunities for legitimate peripheral participation within digital communities, fostering gradual engagement and belonging.',
    },
    {
      title: 'An overview of the history of learning theory',
      citation: 'Illeris, K. (2018). European Journal of Education, 53, 86–101.',
      sourceUrl: 'https://doi.org/10.1111/ejed.12265',
      tags: 'Learning theory, History',
      summary:
        'A concise historical mapping of how major learning theories have evolved and overlapped over time.',
      reflection:
        'This overview helps me situate my work in historical context—seeing constructivism and experiential learning as iterative responses to older paradigms.',
    },
    {
      title:
        'Piaget’s Constructivism, Papert’s Constructionism: What’s the difference?',
      citation:
        'Ackermann, E. (2001). Constructivism: Uses and Perspectives in Education, Geneva: Cahier 8, pp. 85–94.',
      sourceUrl: '#',
      tags: 'Constructivism vs. Constructionism',
      summary:
        'Clarifies the conceptual differences between Piaget’s constructivism and Papert’s constructionism.',
      reflection:
        'This piece helps me clarify my use of “constructionism”—especially how learning through public creation differs from individual meaning-making alone.',
    },
  ];

  for (const r of READINGS) {
    await prisma.reflection.upsert({
      where: { sourceUrl: r.sourceUrl },
      update: {},
      create: {
        title: r.title,
        citation: r.citation,
        sourceUrl: r.sourceUrl,
        tags: r.tags,
        summary: r.summary,
        reflection: r.reflection,
      },
    });
  }

  console.log('Seeded reflections from READINGS array.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
