import { createContext, useContext } from 'react';
import { site } from '@content';
import { useResource } from './data.jsx';

const fallback = { businessName: site.name, email: site.email, phone: site.phone, whatsapp: site.whatsapp, address: site.address, hours: site.hours, serviceAreas: site.serviceAreas, socials: site.socials, showPrices: true, bookingEnabled: true, announcement: '' };
const SettingsContext = createContext(fallback);

export function SettingsProvider({ children }) {
  const { data } = useResource('/settings/public', fallback);
  return <SettingsContext.Provider value={{ ...fallback, ...data }}>{children}</SettingsContext.Provider>;
}
export const useSettings = () => useContext(SettingsContext);
