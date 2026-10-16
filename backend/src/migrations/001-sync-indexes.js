// Creates all indexes declared on the Mongoose models.
import * as models from '../models/index.js';

export async function up() {
  for (const Model of Object.values(models)) {
    await Model.createCollection().catch(() => {});
    await Model.syncIndexes();
  }
}
