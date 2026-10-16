import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

/**
 * Data layer shared by server prerendering and the browser.
 * - During prerender, `collector` records every API path a page asks for; the build fetches them and renders again.
 * - In the browser, initial data comes from window.__APL_DATA__ (embedded by the prerender) so hydration matches.
 * - Every resource then revalidates against the live API after mount.
 */
const DataContext = createContext({ initial: {}, collector: null });

export function DataProvider({ initial = {}, collector = null, children }) {
  return <DataContext.Provider value={{ initial, collector }}>{children}</DataContext.Provider>;
}

export function useResource(path, fallback) {
  const { initial, collector } = useContext(DataContext);
  if (collector && path) collector.add(path);
  const seeded = path && initial[path] !== undefined ? initial[path] : fallback;
  const [state, setState] = useState({ data: seeded, loading: seeded === undefined, error: null, status: 200 });

  useEffect(() => {
    if (!path) return undefined;
    const ctrl = new AbortController();
    api
      .get(path, { signal: ctrl.signal })
      .then((json) => setState({ data: json.data, meta: json.meta, loading: false, error: null, status: 200 }))
      .catch((err) => {
        if (err.name === 'AbortError') return;
        // Keep bundled fallback content visible if the API is unreachable.
        setState((s) => ({ ...s, loading: false, error: err, status: err.status || 0 }));
      });
    return () => ctrl.abort();
  }, [path]);

  const notFound = state.status === 404 && fallback === undefined && !(path && initial[path]);
  return { ...state, notFound };
}
