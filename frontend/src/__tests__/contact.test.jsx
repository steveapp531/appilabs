import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from '../pages/Contact.jsx';
import { renderAt, mockFetch } from './utils.jsx';

describe('ContactForm', () => {
  it('shows validation errors and does not submit invalid input', async () => {
    const calls = mockFetch(() => ({ status: 201, body: { data: { id: '1' } } }));
    renderAt(<ContactForm onDone={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await screen.findByText('Enter your name')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
    expect(calls.filter((c) => c.url.endsWith('/leads'))).toHaveLength(0);
  });

  it('submits a valid enquiry with attribution', async () => {
    const calls = mockFetch(() => ({ status: 201, body: { data: { id: '1' } } }));
    const onDone = vi.fn();
    sessionStorage.setItem('apl_attr', JSON.stringify({ utmSource: 'google' }));
    renderAt(<ContactForm onDone={onDone} />);
    await userEvent.type(screen.getByLabelText('Name'), 'Ama Mensah');
    await userEvent.type(screen.getByLabelText('Email'), 'ama@example.com');
    await userEvent.type(screen.getByLabelText('Message'), 'We need help with our reporting.');
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
    await waitFor(() => expect(onDone).toHaveBeenCalled());
    const body = JSON.parse(calls.find((c) => c.url.endsWith('/leads')).init.body);
    expect(body).toMatchObject({ name: 'Ama Mensah', type: 'contact', attribution: { utmSource: 'google' } });
  });

  it('maps server validation errors onto fields', async () => {
    mockFetch(() => ({ status: 422, body: { error: { code: 'validation_error', message: 'Some fields need attention.', details: [{ path: 'email', message: 'Domain not allowed' }] } } }));
    renderAt(<ContactForm onDone={() => {}} />);
    await userEvent.type(screen.getByLabelText('Name'), 'Ama Mensah');
    await userEvent.type(screen.getByLabelText('Email'), 'ama@example.com');
    await userEvent.type(screen.getByLabelText('Message'), 'We need help with our reporting.');
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await screen.findByText('Domain not allowed')).toBeInTheDocument();
    expect(screen.getByText('Some fields need attention.')).toBeInTheDocument();
  });
});
