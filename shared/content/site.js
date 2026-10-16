// Single source of truth for brand and contact defaults.
// Values marked PLACEHOLDER must be replaced before launch (admin Settings overrides them at runtime).
export const site = {
  name: 'AppiLabs',
  tagline: 'Vision requires structure to scale.',
  description:
    'AppiLabs builds software, data systems and digital skills for growing businesses, and offers structured academic research support. Based in Accra, working across Africa and remotely.',
  url: 'https://appilabs.com', // PLACEHOLDER: your production domain
  email: 'hello@appilabs.com', // PLACEHOLDER
  phone: '+233 20 000 0000', // PLACEHOLDER
  whatsapp: '', // e.g. 233200000000
  address: 'Accra, Ghana',
  city: 'Accra',
  country: 'GH',
  serviceAreas: ['Ghana', 'Nigeria', 'West Africa', 'Remote worldwide'],
  hours: 'Monday to Friday, 9:00 to 17:00 GMT',
  currency: 'GHS',
  socials: { linkedin: '', x: '', github: '', youtube: '' },
  founder: {
    name: 'Stephen Appiah',
    role: 'Founder',
    // Edit freely. Keep it factual.
    bio: [
      'Stephen works in business intelligence and product management, building reporting systems, KPI trackers and data pipelines for telecom-backed streaming platforms in Ghana, Nigeria and South Sudan.',
      'His path runs from laboratory work to web development to product and BI. That mix shapes how AppiLabs works: careful with data, practical about software, and focused on what the business actually needs to decide.',
    ],
  },
};
