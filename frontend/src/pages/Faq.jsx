import { faqs } from '@content';
import { Seo } from '../components/Seo.jsx';
import { PageHero, FaqList, Split, CtaBand } from '../components/blocks.jsx';
import { pillars } from '../lib/content.js';

export default function Faq() {
  const all = [...faqs, ...pillars.flatMap((p) => p.faqs)];
  return (
    <>
      <Seo title="Frequently asked questions" path="/faq" jsonLd={[{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: all.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }]} />
      <PageHero title="Frequently asked questions" lede="If your question is not here, contact us and we will reply within one working day." />
      <Split id="general" title="General" className="section--surface"><FaqList items={faqs} /></Split>
      {pillars.map((p) => <Split key={p.key} id={`faq-${p.key}`} title={p.name}><FaqList items={p.faqs} /></Split>)}
      <CtaBand title="Still have a question?" primary={{ to: '/contact', label: 'Contact us' }} secondary={{ to: '/book', label: 'Book a call' }} />
    </>
  );
}
