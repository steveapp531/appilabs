import { legal } from '@content';
import { Seo } from '../components/Seo.jsx';
import { PageHero } from '../components/blocks.jsx';
import { openConsentSettings } from '../components/ConsentBanner.jsx';
import { useSettings } from '../lib/settings.jsx';

export default function Legal({ doc }) {
  const d = legal[doc];
  const { email } = useSettings();
  return (
    <>
      <Seo title={d.title} path={`/${doc}`} />
      <PageHero title={d.title} lede={`Last updated ${new Date(d.updated).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}. Questions: ${email}.`} />
      <section className="section section--surface">
        <div className="container prose">
          {d.sections.map((s) => (
            <section key={s.h}><h2>{s.h}</h2>{s.p.map((t) => <p key={t}>{t}</p>)}</section>
          ))}
          {doc === 'cookies' ? <button className="btn" onClick={openConsentSettings}>Change my analytics choice</button> : null}
        </div>
      </section>
    </>
  );
}
