import env from '../../config/env.js';

const wrap = (body) => `${body}\n\nAppiLabs\n${env.PUBLIC_SITE_URL}\n`;
const html = (text) => `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#13232e">${text
  .split('\n\n')
  .map((p) => `<p>${p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>')}</p>`)
  .join('')}</div>`;
const mk = (subject, text) => ({ subject, text: wrap(text), html: html(wrap(text)) });

export const templates = {
  leadReceived: (lead) =>
    mk('We received your enquiry', `Hello ${lead.name},\n\nThank you for contacting AppiLabs. We have your request and will reply within one working day.\n\nYour reference: ${lead._id}`),
  bookingReceived: (b) =>
    mk('Your consultation request', `Hello ${b.name},\n\nThank you for requesting a consultation. We will confirm a time by email within one working day.\n\nTopic: ${b.topic || b.pillar}`),
  enrollmentReceived: (e) =>
    mk(`Your place on ${e.courseTitle}`, `Hello ${e.name},\n\nThank you for enrolling in ${e.courseTitle}. ${e.status === 'paid' ? 'Your payment is confirmed and your place is secured.' : 'We will be in touch with cohort dates and next steps.'}`),
  paymentConfirmed: (e) =>
    mk('Payment confirmed', `Hello ${e.name},\n\nYour payment for ${e.courseTitle} is confirmed. Reference: ${e.paymentReference}.`),
  researchReceived: (r) =>
    mk('We received your research support request', `Hello ${r.name},\n\nThank you for your request. A member of the Academy team will review it and reply with a plan and quote within one working day.\n\nReminder: our support is tutoring, guidance, analysis support and feedback. The work you submit remains your own.`),
  confirmSubscription: (url) =>
    mk('Confirm your subscription', `Please confirm that you want to receive the AppiLabs newsletter by opening this link:\n\n${url}\n\nIf you did not request this, ignore this email.`),
  resourceDelivery: (title, url) => mk(`Your download: ${title}`, `Here is the resource you requested:\n\n${url}`),
  adminAlert: (kind, summary) => mk(`[AppiLabs] New ${kind}`, `${summary}\n\nOpen the admin dashboard: ${env.PUBLIC_SITE_URL}/admin`),
};
