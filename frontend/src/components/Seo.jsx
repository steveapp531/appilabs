import { Helmet } from 'react-helmet-async';
import { site } from '@content';
import { SITE_URL, GSC_VERIFICATION } from '../lib/config.js';

export const absolute = (path = '/') => `${SITE_URL}${path === '/' ? '' : path}`;

export const orgJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${SITE_URL}/#org`,
  name: site.name,
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.svg`,
  image: `${SITE_URL}/og-image.png`,
  description: site.description,
  email: site.email,
  telephone: site.phone,
  address: { '@type': 'PostalAddress', addressLocality: site.city, addressCountry: site.country },
  areaServed: site.serviceAreas,
  founder: { '@type': 'Person', name: site.founder.name },
});

export const breadcrumbJsonLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absolute(it.path) })),
});

export function Seo({ title, description, path = '/', type = 'website', image = '/og-image.png', jsonLd = [], noindex = false }) {
  const fullTitle = title ? `${title} | ${site.name}` : `${site.name}: software, data and skills to scale your business`;
  const desc = description || site.description;
  const url = absolute(path);
  return (
    <Helmet prioritizeSeoTags>
      <html lang="en-GB" />
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {GSC_VERIFICATION && <meta name="google-site-verification" content={GSC_VERIFICATION} />}
      <meta property="og:site_name" content={site.name} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={`${SITE_URL}${image}`} />
      <meta property="og:locale" content="en_GB" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {jsonLd.map((obj, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(obj)}</script>
      ))}
    </Helmet>
  );
}
