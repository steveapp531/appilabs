import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Start from '../pages/Start.jsx';
import { renderAt, mockFetch } from './utils.jsx';

describe('Start a project (3-step onboarding)', () => {
  it('walks through three steps and submits a project lead', async () => {
    const calls = mockFetch((url) => (url.endsWith('/leads') ? { status: 201, body: { data: { id: 'x' } } } : { body: { data: {} } }));
    renderAt(<Start />, { path: '/start', route: '/start' });

    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('Choose an area')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('radio', { name: /Consulting/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await userEvent.selectOptions(screen.getByLabelText(/Which Consulting service/), 'fractional-cto');
    await userEvent.type(screen.getByLabelText('What are you trying to achieve?'), 'We need senior technical leadership for our roadmap.');
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await userEvent.type(screen.getByLabelText('Name'), 'Kofi Adjei');
    await userEvent.type(screen.getByLabelText(/^Email/), 'kofi@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Send project details' }));

    expect(await screen.findByText('Thank you page')).toBeInTheDocument();
    const body = JSON.parse(calls.find((c) => c.url.endsWith('/leads')).init.body);
    expect(body).toMatchObject({ pillar: 'consulting', serviceSlug: 'fractional-cto', type: 'project', email: 'kofi@example.com' });
  });

  it('preselects area and service from the URL and starts at step 2', async () => {
    mockFetch(() => ({ body: { data: {} } }));
    renderAt(<Start />, { path: '/start', route: '/start?pillar=solutions&service=web-applications' });
    await waitFor(() => expect(screen.getByLabelText(/Which Solutions service/)).toHaveValue('web-applications'));
  });
});
