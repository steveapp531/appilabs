import { captureAttribution, getAttribution } from '../lib/attribution.js';
import { priceLabel, money } from '../lib/format.js';
import { Markdown } from '../lib/markdown.jsx';
import { render } from '@testing-library/react';
import { ServiceList } from '../components/blocks.jsx';
import { renderAt } from './utils.jsx';
import { servicesFor } from '../lib/content.js';
import { screen } from '@testing-library/react';

describe('attribution', () => {
  it('captures UTM parameters and external referrer once per session', () => {
    const loc = { search: '?utm_source=linkedin&utm_campaign=launch&ref=AMA1', origin: 'https://appilabs.com', pathname: '/consulting' };
    expect(captureAttribution(loc, 'https://www.linkedin.com/feed')).toMatchObject({ utmSource: 'linkedin', utmCampaign: 'launch', referralCode: 'AMA1', landingPage: '/consulting' });
    captureAttribution({ ...loc, search: '?utm_source=other' }, '');
    expect(getAttribution().utmSource).toBe('linkedin');
  });
});

describe('formatting', () => {
  it('formats prices for each pricing model', () => {
    expect(money(180000)).toBe('GHS 1,800');
    expect(priceLabel({ model: 'quote' }).main).toBe('Quoted after a call');
    expect(priceLabel({ model: 'from', amount: 500000, currency: 'GHS' }).main).toBe('From GHS 5,000');
    expect(priceLabel({ model: 'retainer', amount: 150000, currency: 'GHS' }).main).toBe('From GHS 1,500 / month');
  });
});

describe('Markdown', () => {
  it('renders headings and lists and never raw HTML', () => {
    const { container } = render(<Markdown source={'## Title\n\n- one\n- two\n\nHello <script>x</script> **bold**'} />);
    expect(container.querySelector('h2').textContent).toBe('Title');
    expect(container.querySelectorAll('li')).toHaveLength(2);
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('strong').textContent).toBe('bold');
  });
});

describe('ServiceList', () => {
  it('links every service to its detail page', () => {
    renderAt(<ServiceList items={servicesFor('consulting')} />);
    expect(screen.getByRole('link', { name: 'Fractional CTO' })).toHaveAttribute('href', '/consulting/fractional-cto');
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(10);
  });
});
