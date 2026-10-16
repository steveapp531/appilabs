// Minimal, safe Markdown renderer for articles: headings, paragraphs, lists, bold, italic, links.
// No raw HTML is ever rendered.
function inline(text, keyBase) {
  const parts = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)\s]+\))/g;
  let last = 0;
  let m;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyBase}-${i++}`;
    if (tok.startsWith('**')) parts.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith('[')) {
      const [, label, href] = tok.match(/\[([^\]]+)\]\(([^)]+)\)/);
      const safe = /^(https?:\/\/|\/|mailto:)/.test(href) ? href : '#';
      parts.push(<a key={key} href={safe} rel={safe.startsWith('http') ? 'noopener noreferrer' : undefined}>{label}</a>);
    } else parts.push(<em key={key}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function Markdown({ source = '' }) {
  const blocks = source.replace(/\r/g, '').split(/\n{2,}/);
  return blocks.map((block, bi) => {
    const lines = block.split('\n').filter(Boolean);
    if (!lines.length) return null;
    if (/^### /.test(lines[0])) return <h3 key={bi}>{inline(lines[0].slice(4), bi)}</h3>;
    if (/^## /.test(lines[0])) return <h2 key={bi}>{inline(lines[0].slice(3), bi)}</h2>;
    if (lines.every((l) => /^[-*] /.test(l))) return <ul key={bi}>{lines.map((l, li) => <li key={li}>{inline(l.slice(2), `${bi}-${li}`)}</li>)}</ul>;
    if (lines.every((l) => /^\d+\. /.test(l))) return <ol key={bi}>{lines.map((l, li) => <li key={li}>{inline(l.replace(/^\d+\. /, ''), `${bi}-${li}`)}</li>)}</ol>;
    return <p key={bi}>{inline(lines.join(' '), bi)}</p>;
  });
}
