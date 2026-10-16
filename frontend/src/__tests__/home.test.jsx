import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import Home from '../pages/Home.jsx';
import { renderAt, mockFetch } from './utils.jsx';

describe('home page', () => {
  it('keeps the homepage focused and lets visitors explore services and steps', async () => {
    mockFetch(() => ({ body: { data: [] } }));
    const user = userEvent.setup();
    renderAt(<Home />);

    expect(screen.getByRole('img', { name: /Solutions, Consulting and Academy/ })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Academy' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'What would you like to work better?' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Build a web app' }));
    expect(screen.getByRole('heading', { name: 'Custom web applications and SaaS platforms' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Step 2: Proposal' }));
    expect(screen.getByText('A written scope, price and plan. No surprises later.')).toBeInTheDocument();
  });
});
