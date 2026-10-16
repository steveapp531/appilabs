import { money, date, dateTime } from '../lib/format.js';

const status = (values) => ({ key: 'status', label: 'Status', options: values });
const LEAD = ['new', 'contacted', 'qualified', 'converted', 'closed'];

// Field types for the content editor: text, textarea, markdown, list (one item per line), select, number, money, checkbox, date
export const RESOURCES = {
  leads: {
    title: 'Leads', singular: 'lead', path: '/admin/leads', csv: true,
    filters: [status(LEAD), { key: 'pillar', label: 'Area', options: ['solutions', 'consulting', 'academy', 'general'] }, { key: 'type', label: 'Type', options: ['contact', 'project', 'corporate_training', 'resource'] }],
    columns: [
      { key: 'createdAt', label: 'Received', render: (r) => date(r.createdAt) },
      { key: 'name', label: 'Name', render: (r) => <><strong>{r.name}</strong><small>{r.email}</small></> },
      { key: 'type', label: 'Type' },
      { key: 'pillar', label: 'Area' },
      { key: 'status', label: 'Status', badge: true },
    ],
    detail: ['type', 'pillar', 'serviceSlug', 'email', 'phone', 'company', 'goal', 'message', 'timeline', 'budget', 'teamSize', 'resourceSlug', 'marketingConsent', 'attribution', 'firstRespondedAt'],
    update: { statuses: LEAD, notes: true },
  },
  bookings: {
    title: 'Consultations', singular: 'booking', path: '/admin/bookings', csv: true,
    filters: [status(['requested', 'confirmed', 'completed', 'cancelled'])],
    columns: [
      { key: 'createdAt', label: 'Requested', render: (r) => date(r.createdAt) },
      { key: 'name', label: 'Name', render: (r) => <><strong>{r.name}</strong><small>{r.email}</small></> },
      { key: 'topic', label: 'Topic' },
      { key: 'preferredDates', label: 'Preferred', render: (r) => (r.preferredDates || []).map(dateTime).join(', ') },
      { key: 'status', label: 'Status', badge: true },
    ],
    detail: ['email', 'phone', 'company', 'pillar', 'topic', 'mode', 'preferredDates', 'timezone', 'notes', 'scheduledAt', 'attribution'],
    update: { statuses: ['requested', 'confirmed', 'completed', 'cancelled'], notes: true, scheduledAt: true },
  },
  enrollments: {
    title: 'Enrollments', singular: 'enrollment', path: '/admin/enrollments', csv: true,
    filters: [status(['interested', 'pending_payment', 'paid', 'cancelled', 'completed'])],
    columns: [
      { key: 'createdAt', label: 'Date', render: (r) => date(r.createdAt) },
      { key: 'name', label: 'Learner', render: (r) => <><strong>{r.name}</strong><small>{r.email}</small></> },
      { key: 'courseTitle', label: 'Course' },
      { key: 'amount', label: 'Fee', render: (r) => money(r.amount, r.currency) },
      { key: 'status', label: 'Status', badge: true },
    ],
    detail: ['courseTitle', 'email', 'phone', 'organization', 'experienceLevel', 'goals', 'amount', 'paymentReference', 'paidAt', 'attribution'],
    update: { statuses: ['interested', 'pending_payment', 'paid', 'cancelled', 'completed'], notes: true },
  },
  'research-requests': {
    title: 'Research requests', singular: 'research request', path: '/admin/research-requests', csv: true,
    filters: [status(['new', 'reviewing', 'quoted', 'in_progress', 'completed', 'declined', 'closed']), { key: 'academicLevel', label: 'Level', options: ['undergraduate', 'masters', 'doctoral', 'professional', 'other'] }],
    columns: [
      { key: 'createdAt', label: 'Received', render: (r) => date(r.createdAt) },
      { key: 'name', label: 'Student', render: (r) => <><strong>{r.name}</strong><small>{r.email}</small></> },
      { key: 'serviceSlug', label: 'Service' },
      { key: 'deadline', label: 'Deadline', render: (r) => date(r.deadline) },
      { key: 'status', label: 'Status', badge: true },
    ],
    detail: ['serviceSlug', 'academicLevel', 'discipline', 'institution', 'topic', 'requirements', 'deadline', 'supportMode', 'email', 'phone', 'integrityAcknowledged', 'quoteAmount', 'attribution'],
    update: { statuses: ['new', 'reviewing', 'quoted', 'in_progress', 'completed', 'declined', 'closed'], notes: true, quote: true },
    files: true,
  },
  subscribers: {
    title: 'Subscribers', singular: 'subscriber', path: '/admin/subscribers', csv: true,
    filters: [status(['pending', 'active', 'unsubscribed'])],
    columns: [{ key: 'email', label: 'Email' }, { key: 'source', label: 'Source' }, { key: 'consentAt', label: 'Consent', render: (r) => date(r.consentAt) }, { key: 'status', label: 'Status', badge: true }],
    detail: ['email', 'name', 'source', 'consentAt', 'confirmedAt', 'unsubscribedAt'],
    update: { statuses: ['pending', 'active', 'unsubscribed'] },
  },
  payments: {
    title: 'Payments', singular: 'payment', path: '/admin/payments',
    filters: [status(['initialized', 'success', 'failed', 'abandoned'])],
    columns: [{ key: 'createdAt', label: 'Date', render: (r) => date(r.createdAt) }, { key: 'reference', label: 'Reference' }, { key: 'email', label: 'Email' }, { key: 'amount', label: 'Amount', render: (r) => money(r.amount, r.currency) }, { key: 'status', label: 'Status', badge: true }],
    detail: ['reference', 'provider', 'email', 'amount', 'currency', 'channel', 'verifiedAt', 'failureReason'],
  },
  services: {
    title: 'Services', singular: 'service', path: '/admin/services', content: true,
    filters: [{ key: 'pillar', label: 'Pillar', options: ['solutions', 'consulting', 'academy'] }, status(['published', 'draft'])],
    columns: [{ key: 'title', label: 'Title', render: (r) => <><strong>{r.title}</strong><small>/{r.slug}</small></> }, { key: 'pillar', label: 'Pillar' }, { key: 'order', label: 'Order' }, { key: 'status', label: 'Status', badge: true }],
    fields: [
      { key: 'title', type: 'text', required: true }, { key: 'slug', type: 'text', required: true, hint: 'Changing it keeps the old URL working with a redirect.' },
      { key: 'pillar', type: 'select', options: ['solutions', 'consulting', 'academy'], required: true }, { key: 'track', type: 'select', options: ['', 'training', 'research'] },
      { key: 'summary', type: 'textarea', required: true }, { key: 'outcome', type: 'textarea' }, { key: 'description', type: 'textarea' },
      { key: 'deliverables', type: 'list' }, { key: 'useCases', type: 'list' },
      { key: 'pricing.model', type: 'select', options: ['quote', 'from', 'fixed', 'retainer'] }, { key: 'pricing.amount', type: 'money' }, { key: 'pricing.isDemoPrice', type: 'checkbox', label: 'Demo price (confirm before launch)' },
      { key: 'order', type: 'number' }, { key: 'status', type: 'select', options: ['published', 'draft'] }, { key: 'seo.title', type: 'text' }, { key: 'seo.description', type: 'textarea' },
    ],
  },
  courses: {
    title: 'Courses', singular: 'course', path: '/admin/courses', content: true,
    filters: [status(['published', 'draft'])],
    columns: [{ key: 'title', label: 'Title', render: (r) => <><strong>{r.title}</strong><small>/{r.slug}</small></> }, { key: 'price', label: 'Fee', render: (r) => money(r.price, r.currency) }, { key: 'nextCohort', label: 'Next cohort' }, { key: 'status', label: 'Status', badge: true }],
    fields: [
      { key: 'title', type: 'text', required: true }, { key: 'slug', type: 'text', required: true }, { key: 'summary', type: 'textarea', required: true }, { key: 'description', type: 'textarea' },
      { key: 'level', type: 'text' }, { key: 'format', type: 'text' }, { key: 'duration', type: 'text' }, { key: 'price', type: 'money', required: true }, { key: 'isDemoPrice', type: 'checkbox', label: 'Demo price (confirm before launch)' },
      { key: 'audience', type: 'select', options: ['both', 'individual', 'corporate'] }, { key: 'outcomes', type: 'list' }, { key: 'prerequisites', type: 'list' },
      { key: 'nextCohort', type: 'text' }, { key: 'seats', type: 'number' }, { key: 'order', type: 'number' }, { key: 'status', type: 'select', options: ['published', 'draft'] },
    ],
  },
  blog: {
    title: 'Insights', singular: 'article', path: '/admin/blog', content: true,
    filters: [status(['published', 'draft'])],
    columns: [{ key: 'title', label: 'Title', render: (r) => <><strong>{r.title}</strong><small>/{r.slug}</small></> }, { key: 'publishedAt', label: 'Published', render: (r) => date(r.publishedAt) }, { key: 'isDemo', label: 'Sample', render: (r) => (r.isDemo ? 'Yes' : '') }, { key: 'status', label: 'Status', badge: true }],
    fields: [
      { key: 'title', type: 'text', required: true }, { key: 'slug', type: 'text', required: true }, { key: 'excerpt', type: 'textarea', required: true },
      { key: 'body', type: 'markdown', required: true, hint: 'Markdown: ## heading, - list item, **bold**, *italic*, [link](https://...)' },
      { key: 'tags', type: 'list' }, { key: 'author', type: 'text' }, { key: 'readingMinutes', type: 'number' }, { key: 'publishedAt', type: 'date' },
      { key: 'isDemo', type: 'checkbox', label: 'Sample content (shows a Sample label)' }, { key: 'status', type: 'select', options: ['draft', 'published'] }, { key: 'seo.title', type: 'text' }, { key: 'seo.description', type: 'textarea' },
    ],
  },
  'case-studies': {
    title: 'Case studies', singular: 'case study', path: '/admin/case-studies', content: true,
    filters: [status(['published', 'draft'])],
    columns: [{ key: 'title', label: 'Title', render: (r) => <><strong>{r.title}</strong><small>/{r.slug}</small></> }, { key: 'sector', label: 'Sector' }, { key: 'isDemo', label: 'Illustrative', render: (r) => (r.isDemo ? 'Yes' : '') }, { key: 'status', label: 'Status', badge: true }],
    fields: [
      { key: 'title', type: 'text', required: true }, { key: 'slug', type: 'text', required: true }, { key: 'pillar', type: 'select', options: ['solutions', 'consulting', 'academy'] }, { key: 'sector', type: 'text' },
      { key: 'summary', type: 'textarea' }, { key: 'challenge', type: 'textarea' }, { key: 'approach', type: 'list' }, { key: 'deliverables', type: 'list' },
      { key: 'result', type: 'textarea', hint: 'Only real results the client has approved for publication.' },
      { key: 'isDemo', type: 'checkbox', label: 'Illustrative example (shows a label)' }, { key: 'status', type: 'select', options: ['draft', 'published'] },
    ],
  },
};

export const humanize = (k) => k.replace(/^.*\./, '').replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').replace(/^./, (c) => c.toUpperCase());
