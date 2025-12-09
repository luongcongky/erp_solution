import PostgreSQLAdapter from './adapters/PostgreSQLAdapter.js';

let dbInstance = null;

export async function getDatabase() {
  if (!dbInstance) {
    dbInstance = new PostgreSQLAdapter();
    await dbInstance.connect();
  }
  return dbInstance;
}

export default getDatabase;
