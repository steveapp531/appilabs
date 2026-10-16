// Sample articles (isDemo: true). Edit, unpublish or replace them from the admin dashboard.
export const posts = [
  {
    slug: 'signs-your-business-has-outgrown-spreadsheets',
    title: 'Five signs your business has outgrown spreadsheets',
    excerpt: 'Spreadsheets are a great place to start. Here is how to tell when they have started costing you more than they save.',
    tags: ['Automation', 'Operations'],
    author: 'AppiLabs',
    publishedAt: '2026-09-02',
    readingMinutes: 4,
    body: `Spreadsheets are where most good businesses start. They are flexible, familiar and free. The trouble begins when a growing business keeps asking them to do the work of a system.

## 1. Several versions of the truth

If two people bring different numbers to the same meeting, the problem is rarely the people. It is usually copies of the same file drifting apart.

## 2. One person holds it all together

When a single colleague knows how the master file works, every holiday or resignation becomes a risk.

## 3. Reports take days to compile

Monthly reporting that needs two or three days of copying and pasting is time your team could spend acting on the numbers.

## 4. Errors are found late

Broken formulas and pasted values often surface only when a customer or auditor spots them.

## 5. You cannot answer simple questions quickly

"Which customers bought twice this quarter?" should take minutes. If it takes a day, the data is in the wrong shape.

## What to do next

You do not need to replace everything at once. Start by listing the reports and workflows that cause the most pain, then automate the one with the clearest payoff. A small, reliable system usually beats a large, ambitious one.`,
  },
  {
    slug: 'how-to-scope-an-mvp',
    title: 'How to scope an MVP without overbuilding',
    excerpt: 'A minimum viable product should answer one question. These steps help you cut the build to what tests it.',
    tags: ['Product', 'Solutions'],
    author: 'AppiLabs',
    publishedAt: '2026-09-16',
    readingMinutes: 5,
    body: `An MVP is not a smaller version of your final product. It is the smallest thing that tests your riskiest assumption with real users.

## Write down the assumption

"Small clinics will pay monthly to send appointment reminders" is testable. "People need better healthcare" is not.

## Find the one journey that tests it

List every feature you want, then mark the ones a user needs to complete that single journey. Everything else waits.

## Decide what success looks like before you build

Agree on a number. For example, 10 paying clinics within 8 weeks of launch. Without it, every result looks encouraging.

## Fake what you can

Manual processes behind a simple interface are fine at the start. Automate them once you know they matter.

## Plan the second release now

Knowing what comes next makes it easier to leave features out of the first version.`,
  },
  {
    slug: 'choosing-a-research-methodology',
    title: 'Choosing a research methodology: a practical guide',
    excerpt: 'Your methodology should follow from your research questions. Here is a simple way to make, and defend, that choice.',
    tags: ['Research', 'Academy'],
    author: 'AppiLabs Academy',
    publishedAt: '2026-09-30',
    readingMinutes: 6,
    body: `Many students pick a method first and then try to fit their questions around it. Examiners notice. Start from the questions instead.

## Look at the verbs in your questions

Questions that ask "how much", "how many" or "what is the relationship between" usually point to quantitative designs. Questions that ask "how" or "why" people experience something usually point to qualitative designs.

## Match the design to the question

- Surveys suit questions about prevalence and relationships across a population.
- Interviews and focus groups suit questions about meaning and experience.
- Mixed methods suit questions that need both breadth and depth.

## Think about access and time

The best design on paper is useless if you cannot reach participants before your deadline. Be honest about access.

## Justify every choice

For each decision, write one sentence on why it fits your question and one on what you gave up by choosing it. That paragraph often becomes the strongest part of your methodology chapter.`,
  },
  {
    slug: 'fractional-cto-first-90-days',
    title: 'What a fractional CTO does in the first 90 days',
    excerpt: 'A practical look at how part time technical leadership is usually structured, from assessment to roadmap.',
    tags: ['Consulting', 'Leadership'],
    author: 'AppiLabs',
    publishedAt: '2026-10-07',
    readingMinutes: 4,
    body: `Hiring a fractional CTO is a way to get senior technical judgement without a full time executive salary. The first three months usually follow a clear pattern.

## Days 1 to 30: understand

Meet the team and vendors, review systems and code, and understand the business plan. The output is an honest assessment.

## Days 31 to 60: decide

Agree priorities with leadership. Typical decisions include what to build, buy or retire, and what skills to hire.

## Days 61 to 90: set up for delivery

Put in place a roadmap, a delivery rhythm and simple reporting so progress is visible to the whole leadership team.

## After 90 days

Some companies keep the arrangement for years. Others use it to prepare for a full time hire, with the fractional CTO helping to recruit their successor.`,
  },
].map((p) => ({ ...p, status: 'published', isDemo: true }));
