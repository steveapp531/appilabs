// Reporting queries shared by the admin dashboard and the automation API (used by the Python jobs).
import { Lead, Booking, Enrollment, ResearchRequest, Subscriber, Payment, AnalyticsEvent } from '../models/index.js';

const DAY = 86400000;
const countBy = async (Model, field, match = {}) => {
  const rows = await Model.aggregate([{ $match: match }, { $group: { _id: `$${field}`, count: { $sum: 1 } } }]);
  return Object.fromEntries(rows.map((r) => [r._id ?? 'unknown', r.count]).sort((a, b) => b[1] - a[1]));
};

const sourceOf = (doc) => {
  const a = doc.attribution || {};
  if (a.utmSource) return a.utmSource;
  if (a.referrer) {
    try {
      return new URL(a.referrer).hostname.replace(/^www\./, '');
    } catch {
      return 'referral';
    }
  }
  return 'direct';
};

const tally = (docs, fn) => docs.reduce((acc, d) => ((acc[fn(d)] = (acc[fn(d)] || 0) + 1), acc), {});

export async function staleInquiries(hours = 48) {
  const cutoff = new Date(Date.now() - hours * 3600000);
  const pick = 'name email pillar type serviceSlug createdAt status';
  const [leads, research] = await Promise.all([
    Lead.find({ status: 'new', type: { $ne: 'resource' }, createdAt: { $lte: cutoff } }).select(pick).sort('createdAt').lean(),
    ResearchRequest.find({ status: 'new', createdAt: { $lte: cutoff } }).select('name email serviceSlug academicLevel deadline createdAt status').sort('createdAt').lean(),
  ]);
  const age = (d) => Math.round((Date.now() - new Date(d.createdAt).getTime()) / 3600000);
  return {
    thresholdHours: hours,
    leads: leads.map((l) => ({ ...l, ageHours: age(l) })),
    researchRequests: research.map((r) => ({ ...r, ageHours: age(r) })),
    total: leads.length + research.length,
  };
}

export async function dailySummary(dateStr) {
  const start = dateStr ? new Date(`${dateStr}T00:00:00Z`) : new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z');
  const end = new Date(start.getTime() + DAY);
  const range = { createdAt: { $gte: start, $lt: end } };
  const [leads, bookings, research, enrollments, subscribers] = await Promise.all([
    Lead.find(range).select('name email type pillar serviceSlug attribution createdAt').lean(),
    Booking.find(range).select('name email topic pillar preferredDates attribution').lean(),
    ResearchRequest.find(range).select('name email serviceSlug academicLevel deadline attribution').lean(),
    Enrollment.find(range).select('name email courseTitle status amount attribution').lean(),
    Subscriber.countDocuments(range),
  ]);
  return {
    date: start.toISOString().slice(0, 10),
    totals: { leads: leads.length, bookings: bookings.length, researchRequests: research.length, enrollments: enrollments.length, newSubscribers: subscribers },
    leadsByPillar: tally(leads, (l) => l.pillar),
    bySource: tally([...leads, ...bookings, ...research, ...enrollments], sourceOf),
    leads,
    bookings,
    researchRequests: research,
    enrollments,
  };
}

export async function upcomingBookings(days = 7) {
  const now = new Date();
  const until = new Date(Date.now() + days * DAY);
  const [confirmed, requested] = await Promise.all([
    Booking.find({ status: 'confirmed', scheduledAt: { $gte: now, $lte: until } }).sort('scheduledAt').lean(),
    Booking.find({ status: 'requested', preferredDates: { $elemMatch: { $gte: now, $lte: until } } }).sort('createdAt').lean(),
  ]);
  return { windowDays: days, confirmed, awaitingConfirmation: requested };
}

export async function enrollmentSummary(days = 30) {
  const since = new Date(Date.now() - days * DAY);
  const rows = await Enrollment.find({ createdAt: { $gte: since } }).select('courseTitle status amount currency').lean();
  const byCourse = {};
  for (const e of rows) {
    const c = (byCourse[e.courseTitle] ??= { total: 0, paid: 0, pending_payment: 0, interested: 0, cancelled: 0, completed: 0, revenue: 0 });
    c.total += 1;
    c[e.status] = (c[e.status] || 0) + 1;
    if (e.status === 'paid' || e.status === 'completed') c.revenue += e.amount || 0;
  }
  const revenue = Object.values(byCourse).reduce((s, c) => s + c.revenue, 0);
  return { windowDays: days, total: rows.length, revenueMinor: revenue, currency: 'GHS', byCourse };
}

export async function weeklyActivity() {
  const since = new Date(Date.now() - 7 * DAY);
  const range = { createdAt: { $gte: since } };
  const [leadStatus, leadPillar, bookings, research, enrollments, payments, subscribers, events, leadDocs] = await Promise.all([
    countBy(Lead, 'status', range),
    countBy(Lead, 'pillar', range),
    countBy(Booking, 'status', range),
    countBy(ResearchRequest, 'status', range),
    countBy(Enrollment, 'status', range),
    Payment.find({ status: 'success', verifiedAt: { $gte: since } }).select('amount').lean(),
    Subscriber.countDocuments({ status: 'active', confirmedAt: { $gte: since } }),
    countBy(AnalyticsEvent, 'name', range),
    Lead.find(range).select('attribution').lean(),
  ]);
  return {
    periodStart: since.toISOString().slice(0, 10),
    periodEnd: new Date().toISOString().slice(0, 10),
    leads: { byStatus: leadStatus, byPillar: leadPillar, bySource: tally(leadDocs, sourceOf) },
    bookings,
    researchRequests: research,
    enrollments,
    payments: { count: payments.length, revenueMinor: payments.reduce((s, p) => s + p.amount, 0), currency: 'GHS' },
    newSubscribers: subscribers,
    events,
  };
}

export async function dashboard() {
  const weekAgo = new Date(Date.now() - 7 * DAY);
  const [newLeads, leadsWeek, leadStatus, upcoming, enrollStatus, openResearch, subscribers, revenue, recentLeads, recentResearch] = await Promise.all([
    Lead.countDocuments({ status: 'new' }),
    Lead.countDocuments({ createdAt: { $gte: weekAgo } }),
    countBy(Lead, 'status'),
    Booking.countDocuments({ status: { $in: ['requested', 'confirmed'] } }),
    countBy(Enrollment, 'status'),
    ResearchRequest.countDocuments({ status: { $in: ['new', 'reviewing', 'quoted', 'in_progress'] } }),
    Subscriber.countDocuments({ status: 'active' }),
    Payment.find({ status: 'success' }).select('amount').lean(),
    Lead.find().sort('-createdAt').limit(6).select('name email pillar type status createdAt').lean(),
    ResearchRequest.find().sort('-createdAt').limit(5).select('name serviceSlug academicLevel deadline status createdAt').lean(),
  ]);
  const leadDocs = await Lead.find({ createdAt: { $gte: new Date(Date.now() - 30 * DAY) } }).select('attribution').lean();
  return {
    metrics: {
      newLeads,
      leadsThisWeek: leadsWeek,
      openBookings: upcoming,
      openResearchRequests: openResearch,
      paidEnrollments: (enrollStatus.paid || 0) + (enrollStatus.completed || 0),
      activeSubscribers: subscribers,
      revenueMinor: revenue.reduce((s, p) => s + p.amount, 0),
    },
    leadStatus,
    enrollmentStatus: enrollStatus,
    sources30d: tally(leadDocs, sourceOf),
    recentLeads,
    recentResearch,
  };
}

export async function analyticsSummary(days = 30) {
  const since = new Date(Date.now() - days * DAY);
  const match = { createdAt: { $gte: since } };
  const [byName, topPaths, leadDocs] = await Promise.all([
    countBy(AnalyticsEvent, 'name', match),
    AnalyticsEvent.aggregate([{ $match: { ...match, name: 'page_view' } }, { $group: { _id: '$path', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 15 }]),
    Lead.find(match).select('attribution pillar').lean(),
  ]);
  return {
    windowDays: days,
    events: byName,
    topPages: topPaths.map((p) => ({ path: p._id, views: p.count })),
    leadSources: tally(leadDocs, sourceOf),
    leadCampaigns: tally(leadDocs.filter((l) => l.attribution?.utmCampaign), (l) => l.attribution.utmCampaign),
  };
}
