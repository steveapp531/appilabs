import { describe, it, expect, beforeAll } from 'vitest';
import { api, loginAs } from './helpers.js';
import { seedContent } from '../src/scripts/seedData.js';
import { ResearchRequest, Upload } from '../src/models/index.js';

const future = () => new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
const payload = (over = {}) => ({
  serviceSlug: 'statistical-analysis',
  academicLevel: 'masters',
  discipline: 'Public Health',
  topic: 'Vaccine uptake among adolescents',
  requirements: 'I have survey data and need guidance on logistic regression and interpretation.',
  deadline: future(),
  name: 'Abena Kyei',
  email: 'abena@example.com',
  integrityAcknowledged: true,
  ...over,
});

beforeAll(async () => {
  await seedContent();
});

describe('research requests', () => {
  it('requires the academic integrity acknowledgement', async () => {
    const res = await api().post('/api/v1/research-requests').send(payload({ integrityAcknowledged: false }));
    expect(res.status).toBe(422);
    expect(res.body.error.details.map((d) => d.path)).toContain('integrityAcknowledged');
  });

  it('rejects a deadline in the past and unknown services', async () => {
    expect((await api().post('/api/v1/research-requests').send(payload({ deadline: '2020-01-01' }))).status).toBe(422);
    expect((await api().post('/api/v1/research-requests').send(payload({ serviceSlug: 'write-my-thesis' }))).status).toBe(422);
  });

  it('accepts a request with a PDF stored privately', async () => {
    const pdf = Buffer.from('%PDF-1.4\n% test document\n');
    const res = await api()
      .post('/api/v1/research-requests')
      .field('payload', JSON.stringify(payload()))
      .attach('files', pdf, { filename: 'chapter-three.pdf', contentType: 'application/pdf' });
    expect(res.status).toBe(201);
    const doc = await ResearchRequest.findById(res.body.data.id);
    expect(doc.files.length).toBe(1);
    const file = await Upload.findById(doc.files[0]);
    expect(file.key).not.toContain('chapter-three'); // random storage key, original name kept only as metadata
    expect(file.expiresAt.getTime()).toBeGreaterThan(Date.now());

    // Files are only reachable through the authenticated admin API.
    expect((await api().get(`/api/v1/admin/files/${file._id}`)).status).toBe(401);
    const owner = await loginAs('owner');
    const dl = await api().get(`/api/v1/admin/files/${file._id}`).set('Authorization', `Bearer ${owner.token}`);
    expect(dl.status).toBe(200);
    expect(dl.headers['content-disposition']).toContain('attachment');
  });

  it('rejects disallowed file types and spoofed content', async () => {
    const exe = await api()
      .post('/api/v1/research-requests')
      .field('payload', JSON.stringify(payload()))
      .attach('files', Buffer.from('MZ'), { filename: 'tool.exe', contentType: 'application/octet-stream' });
    expect(exe.status).toBe(415);

    const fake = await api()
      .post('/api/v1/research-requests')
      .field('payload', JSON.stringify(payload()))
      .attach('files', Buffer.from('not really a pdf'), { filename: 'fake.pdf', contentType: 'application/pdf' });
    expect(fake.status).toBe(415);
  });
});
