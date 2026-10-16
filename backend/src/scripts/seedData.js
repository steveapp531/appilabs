// Seed logic (imported by the CLI and by tests). Seeds catalogue content (idempotent upserts) and, with --demo, sample pipeline records.
// Usage: npm run seed            -> content + settings only
//        npm run seed -- --demo  -> also sample leads, bookings, enrollments, research requests, events
import { Service, Course, BlogPost, CaseStudy, Setting, Lead, Booking, Enrollment, ResearchRequest, Subscriber, AnalyticsEvent, Payment } from '../models/index.js';
import { services, courses, posts, caseStudies, site } from '../../../shared/content/index.js';

async function upsertAll(Model, items) {
  let created = 0;
  for (const item of items) {
    // $setOnInsert keeps admin edits: existing records are never overwritten by the seed.
    const res = await Model.updateOne({ slug: item.slug }, { $setOnInsert: item }, { upsert: true });
    created += res.upsertedCount || 0;
  }
  return created;
}

export async function seedDemoPipeline() {
  await Promise.all([Lead, Booking, Enrollment, ResearchRequest].map((M) => M.deleteMany({ isDemo: true })));
  const hoursAgo = (h) => new Date(Date.now() - h * 3600000);
  const daysAhead = (d) => new Date(Date.now() + d * 86400000);
  const src = (utmSource, utmCampaign) => ({ utmSource, utmCampaign, landingPage: '/' });

  const leads = [
    { type: 'project', pillar: 'solutions', serviceSlug: 'web-applications', name: 'Demo: Ama Mensah', email: 'ama.demo@example.com', company: 'Demo Logistics Ltd', goal: 'Replace our delivery tracking spreadsheet with a web app for dispatchers and drivers.', timeline: '1-3 months', budget: 'GHS 50k-100k', status: 'new', attribution: src('google', 'brand-search'), createdAt: hoursAgo(60) },
    { type: 'project', pillar: 'consulting', serviceSlug: 'business-intelligence', name: 'Demo: Kwame Boateng', email: 'kwame.demo@example.com', company: 'Demo Retail Group', goal: 'Monthly management reporting takes our finance team four days. We want dashboards.', timeline: 'This quarter', status: 'contacted', firstRespondedAt: hoursAgo(20), attribution: src('linkedin', 'bi-awareness'), createdAt: hoursAgo(30) },
    { type: 'contact', pillar: 'general', name: 'Demo: Efua Owusu', email: 'efua.demo@example.com', message: 'Do you offer maintenance for a WordPress site we already have?', status: 'new', attribution: { referrer: 'https://www.facebook.com/' }, createdAt: hoursAgo(5) },
    { type: 'corporate_training', pillar: 'academy', name: 'Demo: Yaw Asante', email: 'yaw.demo@example.com', company: 'Demo Microfinance', teamSize: '11-25', goal: 'Power BI training for our credit and finance teams.', status: 'qualified', firstRespondedAt: hoursAgo(70), createdAt: hoursAgo(96) },
    { type: 'resource', pillar: 'consulting', resourceSlug: 'data-readiness-checklist', name: 'Demo: Akosua Darko', email: 'akosua.demo@example.com', message: 'Downloaded: Data readiness checklist', status: 'new', attribution: src('newsletter', 'october'), createdAt: hoursAgo(3) },
  ];
  await Lead.insertMany(leads.map((l) => ({ ...l, isDemo: true })));

  await Booking.insertMany([
    { name: 'Demo: Kofi Adjei', email: 'kofi.demo@example.com', pillar: 'consulting', topic: 'Fractional CTO for a fintech startup', preferredDates: [daysAhead(2), daysAhead(3)], mode: 'video', status: 'requested', isDemo: true, attribution: src('google', 'fractional-cto') },
    { name: 'Demo: Adwoa Sarpong', email: 'adwoa.demo@example.com', pillar: 'solutions', topic: 'E-commerce store with mobile money', preferredDates: [daysAhead(4)], scheduledAt: daysAhead(4), mode: 'video', status: 'confirmed', isDemo: true },
  ]);

  const powerBi = await Course.findOne({ slug: 'power-bi' });
  const sql = await Course.findOne({ slug: 'sql-fundamentals' });
  await Enrollment.insertMany([
    { course: powerBi._id, courseSlug: powerBi.slug, courseTitle: powerBi.title, name: 'Demo: Nana Ofori', email: 'nana.demo@example.com', status: 'paid', amount: powerBi.price, paidAt: hoursAgo(26), paymentReference: 'DEMO-REF-001', isDemo: true, createdAt: hoursAgo(27) },
    { course: sql._id, courseSlug: sql.slug, courseTitle: sql.title, name: 'Demo: Esi Quaye', email: 'esi.demo@example.com', status: 'pending_payment', amount: sql.price, isDemo: true, createdAt: hoursAgo(10) },
    { course: sql._id, courseSlug: sql.slug, courseTitle: sql.title, name: 'Demo: Kojo Mensah', email: 'kojo.demo@example.com', status: 'interested', amount: sql.price, isDemo: true, createdAt: hoursAgo(50) },
  ]);
  await Payment.deleteMany({ reference: 'DEMO-REF-001' });
  await Payment.create({ reference: 'DEMO-REF-001', provider: 'mock', amount: powerBi.price, currency: 'GHS', status: 'success', verifiedAt: hoursAgo(26), email: 'nana.demo@example.com' });

  await ResearchRequest.insertMany([
    { serviceSlug: 'statistical-analysis', academicLevel: 'masters', discipline: 'Public Health', institution: 'Demo University', topic: 'Factors associated with vaccine uptake among adolescents', requirements: 'I have survey data from 320 respondents and need guidance choosing and interpreting logistic regression.', deadline: daysAhead(21), name: 'Demo: Abena Kyei', email: 'abena.demo@example.com', integrityAcknowledged: true, status: 'new', isDemo: true, createdAt: hoursAgo(55) },
    { serviceSlug: 'research-methodology', academicLevel: 'doctoral', discipline: 'Information Systems', topic: 'Adoption of mobile money among SMEs', requirements: 'Need help justifying a mixed methods design for my proposal defence.', deadline: daysAhead(35), name: 'Demo: Fiifi Annan', email: 'fiifi.demo@example.com', integrityAcknowledged: true, status: 'reviewing', isDemo: true, createdAt: hoursAgo(12) },
  ]);

  await Subscriber.updateOne({ email: 'subscriber.demo@example.com' }, { $setOnInsert: { email: 'subscriber.demo@example.com', status: 'active', consentAt: new Date(), confirmedAt: new Date(), source: 'demo' } }, { upsert: true });

  await AnalyticsEvent.deleteMany({ 'props.demo': true });
  const paths = ['/', '/solutions', '/consulting', '/academy', '/academy/courses/power-bi', '/academy/research', '/insights/how-to-scope-an-mvp'];
  const events = [];
  for (let i = 0; i < 60; i++) events.push({ name: 'page_view', path: paths[i % paths.length], props: { demo: true }, createdAt: hoursAgo(i * 2) });
  for (let i = 0; i < 12; i++) events.push({ name: 'cta_click', path: '/', props: { demo: true, label: 'Start a project' }, createdAt: hoursAgo(i * 6) });
  await AnalyticsEvent.insertMany(events);
}

export async function seedContent() {
  const created = {
    services: await upsertAll(Service, services),
    courses: await upsertAll(Course, courses),
    posts: await upsertAll(BlogPost, posts.map((p) => ({ ...p, publishedAt: new Date(p.publishedAt) }))),
    caseStudies: await upsertAll(CaseStudy, caseStudies),
  };
  await Setting.updateOne(
    { key: 'site' },
    { $setOnInsert: { key: 'site', businessName: site.name, email: site.email, phone: site.phone, whatsapp: site.whatsapp, address: site.address, city: site.city, country: site.country, hours: site.hours, serviceAreas: site.serviceAreas, socials: site.socials } },
    { upsert: true },
  );
  return created;
}
