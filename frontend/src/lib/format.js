export function money(minor, currency = 'GHS') {
  if (minor == null) return '';
  const value = minor / 100;
  return `${currency} ${value.toLocaleString('en-GH', { minimumFractionDigits: value % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
}

export function priceLabel(pricing) {
  if (!pricing || pricing.model === 'quote' || pricing.amount == null) return { main: 'Quoted after a call', note: 'Fixed price agreed before work starts' };
  const amount = money(pricing.amount, pricing.currency);
  if (pricing.model === 'from') return { main: `From ${amount}`, note: 'Final price depends on scope' };
  if (pricing.model === 'retainer') return { main: `From ${amount} / month`, note: 'Monthly retainer' };
  return { main: amount, note: 'Fixed price' };
}

export const date = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
export const dateTime = (d) => (d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '');
