export const pillars = [
  {
    key: 'solutions',
    name: 'Solutions',
    verb: 'We build',
    title: 'Custom web and digital solutions',
    path: '/solutions',
    summary:
      'Websites, web applications, MVPs, internal systems and integrations designed around how your business actually runs.',
    intro:
      'We design, build and maintain the software your operations depend on. Every engagement starts with your workflow, your data and the result you need, then we pick the simplest architecture that will still hold when you grow.',
    outcomes: [
      'Fewer manual steps between a customer request and a delivered result',
      'Systems that share data instead of copying it',
      'Software your team can run, extend and hand over',
    ],
    engagements: [
      { name: 'Fixed scope project', detail: 'A defined deliverable, timeline and price agreed after a short discovery call.' },
      { name: 'Phased build', detail: 'Start with an MVP or pilot, then extend in planned releases.' },
      { name: 'Care plan', detail: 'Monthly maintenance, monitoring, updates and small improvements.' },
    ],
    faqs: [
      { q: 'How long does a typical project take?', a: 'A business website usually takes 3 to 6 weeks. A web application or MVP usually takes 8 to 16 weeks. You get a written timeline before work starts.' },
      { q: 'Do I own the code?', a: 'Yes. On full payment you own the source code, design files and documentation, and the code lives in a repository you control.' },
      { q: 'Can you work with our existing systems?', a: 'Yes. Many projects connect to tools you already use, such as accounting software, payment providers, CRMs or spreadsheets.' },
      { q: 'What happens after launch?', a: 'You can take over with your own team using our handover documentation, or keep us on a monthly care plan.' },
    ],
  },
  {
    key: 'consulting',
    name: 'Consulting',
    verb: 'We advise',
    title: 'IT and data consulting',
    path: '/consulting',
    summary:
      'Fractional technical leadership, data engineering and business intelligence for organisations that need senior guidance without a full time hire.',
    intro:
      'We help leadership teams make technology and data decisions with confidence, then stay to see them implemented. Engagements can be a single review, a defined project, or a monthly retainer.',
    outcomes: [
      'A clear technical roadmap tied to business priorities',
      'Reporting that leadership trusts and uses every week',
      'Data infrastructure that scales without constant firefighting',
    ],
    engagements: [
      { name: 'Assessment', detail: 'A fixed fee review with written findings and a prioritised action plan.' },
      { name: 'Project', detail: 'A defined piece of work, such as a data warehouse, BI rollout or migration.' },
      { name: 'Retainer', detail: 'A set number of days per month of advisory and hands-on support.' },
    ],
    faqs: [
      { q: 'What is a fractional CTO?', a: 'An experienced technology leader who works with you part time, typically a few days a month, to own technical strategy, vendor decisions and team guidance.' },
      { q: 'Do you only advise, or do you implement too?', a: 'Both. Many clients start with an assessment and then ask us to implement the recommendations.' },
      { q: 'Which tools do you work with?', a: 'We are tool agnostic. Common stacks include PostgreSQL, MongoDB, Elasticsearch and Kibana, Power BI, Python, cloud data warehouses and the major cloud providers.' },
      { q: 'How do retainers work?', a: 'You book a monthly allocation of days. Unused time does not roll over indefinitely, and you can adjust the allocation with 30 days notice.' },
    ],
  },
  {
    key: 'academy',
    name: 'Academy',
    verb: 'We train and research',
    title: 'Digital skills and academic research support',
    path: '/academy',
    summary:
      'Practical training in data analytics and business tools for individuals and teams, plus structured research guidance for students and researchers.',
    intro:
      'The Academy has two parts. Professional training teaches the data and digital skills people use at work. Research support helps students and researchers plan, analyse and present their own research with expert guidance.',
    outcomes: [
      'Teams who can build and read their own reports',
      'Professionals with portfolio-ready analytics skills',
      'Researchers who understand and can defend their methods',
    ],
    engagements: [
      { name: 'Open courses', detail: 'Scheduled cohorts and masterclasses for individuals.' },
      { name: 'Corporate programmes', detail: 'Training designed around your team, your data and your tools.' },
      { name: 'Research sessions', detail: 'One-to-one guidance, analysis support and feedback on your work.' },
    ],
    faqs: [
      { q: 'Are courses online or in person?', a: 'Most courses run live online. Corporate programmes can be delivered on site in Accra or anywhere by arrangement.' },
      { q: 'Do I get a certificate?', a: 'Participants who complete the course and its practical project receive an AppiLabs certificate of completion.' },
      { q: 'Will you write my assignment or thesis?', a: 'No. We tutor, guide, review and help you analyse your own data. The work you submit must be your own, and our service is designed to support that.' },
      { q: 'What levels of study do you support?', a: 'Undergraduate, master\'s and doctoral students, plus independent and professional researchers.' },
    ],
  },
];

export const pillarByKey = Object.fromEntries(pillars.map((p) => [p.key, p]));
