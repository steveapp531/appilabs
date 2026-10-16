import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { DataProvider } from '../lib/data.jsx';

export function renderAt(ui, { path = '/', route = '/' } = {}) {
  return render(
    <HelmetProvider>
      <DataProvider>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path={path} element={ui} />
            <Route path="/thank-you" element={<p>Thank you page</p>} />
          </Routes>
        </MemoryRouter>
      </DataProvider>
    </HelmetProvider>,
  );
}

/** Mocks fetch: returns `handler(url, init)` result as JSON. */
export function mockFetch(handler) {
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    const { status = 200, body = { data: {} } } = (await handler(String(url), init)) || {};
    return { ok: status < 400, status, json: async () => body };
  };
  return calls;
}
