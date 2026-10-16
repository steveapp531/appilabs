import { Link, useSearchParams } from 'react-router-dom';
import { Seo } from '../components/Seo.jsx';
import { ProcessSteps } from '../components/blocks.jsx';

const content = {
  project: { title: 'Thanks. Your project details are with us.', steps: [{ title: 'We review', detail: 'We read your goal and any files within one working day.' }, { title: 'We reply', detail: 'You get questions or a suggested approach by email.' }, { title: 'Discovery call', detail: 'A free 30 minute call to agree scope.' }, { title: 'Proposal', detail: 'A written scope, price and timeline.' }] },
  contact: { title: 'Thanks. Your message is with us.', steps: [{ title: 'We read it', detail: 'A real person reviews every message.' }, { title: 'We reply', detail: 'Expect an email within one working day.' }] },
  booking: { title: 'Thanks. Your consultation request is in.', steps: [{ title: 'We check availability', detail: 'We match your preferred times with ours.' }, { title: 'You get a confirmation', detail: 'An email with the time and a meeting link or address.' }, { title: 'We meet', detail: 'Bring your questions. No preparation needed.' }] },
  enrollment: { title: 'Thanks. Your place is reserved.', steps: [{ title: 'Confirmation', detail: 'A confirmation email is on its way.' }, { title: 'Joining details', detail: 'Dates, links and pre-course setup are sent before the start.' }] },
  training: { title: 'Thanks. Your training enquiry is with us.', steps: [{ title: 'Short call', detail: 'We learn about your team and goals.' }, { title: 'Outline and price', detail: 'A proposed programme and quote.' }, { title: 'Scheduling', detail: 'Dates that fit your team.' }] },
  research: { title: 'Thanks. Your research request is with us.', steps: [{ title: 'Academy review', detail: 'A specialist reads your request and files.' }, { title: 'Plan and quote', detail: 'Within one working day, by email.' }, { title: 'First session', detail: 'We start once you approve the plan.' }] },
};

export default function ThankYou() {
  const [params] = useSearchParams();
  const c = content[params.get('type')] || content.contact;
  return (
    <section className="section section--flush status-page">
      <Seo title="Thank you" noindex />
      <div className="container">
        <h1 style={{ fontSize: 'var(--step-4)', maxWidth: '24ch' }}>{c.title}</h1>
        <p className="lede">A confirmation email is on its way. Here is what happens next.</p>
        <div style={{ margin: 'var(--s-6) 0' }}><ProcessSteps items={c.steps} /></div>
        <div className="actions">
          <Link className="btn" to="/insights">Read our insights</Link>
          <Link className="btn btn--ghost" to="/">Back to the homepage</Link>
        </div>
      </div>
    </section>
  );
}
