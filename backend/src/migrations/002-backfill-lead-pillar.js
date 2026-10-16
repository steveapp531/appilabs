// Example data migration: older leads without a pillar are tagged "general".
export async function up(db) {
  await db.collection('leads').updateMany({ pillar: { $exists: false } }, { $set: { pillar: 'general' } });
}
