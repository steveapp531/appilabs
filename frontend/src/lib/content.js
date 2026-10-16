import { services, courses, posts, caseStudies, pillars, pillarByKey } from '@content';

export { pillars, pillarByKey };
export const servicesFor = (pillar, track) =>
  services.filter((s) => s.pillar === pillar && (track === undefined || (s.track ?? null) === track));
export const findService = (slug) => services.find((s) => s.slug === slug);
export const findCourse = (slug) => courses.find((c) => c.slug === slug);
export const findPost = (slug) => posts.find((p) => p.slug === slug);
export const findCase = (slug) => caseStudies.find((c) => c.slug === slug);
export const researchServices = services.filter((s) => s.track === 'research');

/** Public URL for a service, based on its pillar and track. */
export function servicePath(s) {
  if (s.track === 'research') return `/academy/research/${s.slug}`;
  return `/${s.pillar}/${s.slug}`;
}

export { services, courses, posts, caseStudies };
