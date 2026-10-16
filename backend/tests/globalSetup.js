// Uses MONGODB_URI_TEST when provided (CI, Docker, Atlas test cluster); otherwise starts an in-memory MongoDB.
let mongod;

export default async function setup({ provide }) {
  let uri = process.env.MONGODB_URI_TEST;
  if (!uri) {
    const { MongoMemoryServer } = await import('mongodb-memory-server-core');
    mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
  }
  provide('mongoUri', uri);
  return async () => {
    if (mongod) await mongod.stop();
  };
}
