import { z } from 'zod';

export const nameField = z.string().trim().min(2, 'Enter your name').max(120);
export const emailField = z.string().trim().email('Enter a valid email address');
export const phoneField = z.string().trim().max(30).regex(/^$|^[+()\d\s-]{6,30}$/, 'Enter a valid phone number').optional();
const optional = (max) => z.string().trim().max(max).optional();

export const contactSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  company: optional(160),
  pillar: z.enum(['general', 'solutions', 'consulting', 'academy']),
  message: z.string().trim().min(10, 'Tell us a little more (at least 10 characters)').max(4000),
  marketingConsent: z.boolean().optional(),
  website: z.string().optional(),
});

export const projectSteps = [
  z.object({ pillar: z.enum(['solutions', 'consulting', 'academy'], { errorMap: () => ({ message: 'Choose an area' }) }) }),
  z.object({
    serviceSlug: z.string().optional(),
    goal: z.string().trim().min(15, 'Describe your goal in a sentence or two (at least 15 characters)').max(2000),
    timeline: optional(60),
    budget: optional(60),
  }),
  z.object({ name: nameField, email: emailField, phone: phoneField, company: optional(160), marketingConsent: z.boolean().optional(), website: z.string().optional() }),
];

export const enrollSteps = [
  z.object({ courseSlug: z.string().min(1, 'Choose a course') }),
  z.object({ name: nameField, email: emailField, phone: phoneField, organization: optional(160), experienceLevel: z.enum(['new', 'some', 'experienced']).optional().or(z.literal('')), goals: optional(1500) }),
  z.object({ agree: z.literal(true, { errorMap: () => ({ message: 'Please accept the course terms' }) }), website: z.string().optional() }),
];

const futureDay = (msg) => z.string().min(1, msg).refine((v) => new Date(v).getTime() > Date.now(), 'Choose a date in the future');

export const researchSteps = [
  z.object({
    serviceSlug: z.string().min(1, 'Choose the kind of support you need'),
    academicLevel: z.enum(['undergraduate', 'masters', 'doctoral', 'professional', 'other'], { errorMap: () => ({ message: 'Choose your level of study' }) }),
    discipline: z.string().trim().min(2, 'Enter your discipline').max(120),
  }),
  z.object({
    topic: z.string().trim().min(5, 'Describe your topic in a few words').max(300),
    requirements: z.string().trim().min(20, 'Tell us a bit more so we can plan properly (at least 20 characters)').max(5000),
    deadline: futureDay('Choose your deadline'),
    supportMode: z.enum(['sessions', 'written_feedback', 'both']),
    institution: optional(160),
  }),
  z.object({
    name: nameField,
    email: emailField,
    phone: phoneField,
    integrityAcknowledged: z.literal(true, { errorMap: () => ({ message: 'Please confirm the academic integrity statement' }) }),
    website: z.string().optional(),
  }),
];

export const bookingSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  company: optional(160),
  pillar: z.enum(['general', 'solutions', 'consulting', 'academy']),
  topic: z.string().trim().min(3, 'What would you like to discuss?').max(200),
  date1: futureDay('Choose at least one date'),
  date2: z.string().optional(),
  mode: z.enum(['video', 'phone', 'in_person']),
  notes: optional(2000),
  website: z.string().optional(),
});

export const corporateSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  company: z.string().trim().min(2, 'Enter your organisation').max(160),
  teamSize: z.string().min(1, 'Choose a team size'),
  goal: z.string().trim().min(15, 'Describe the skills you want to build').max(2000),
  website: z.string().optional(),
});
