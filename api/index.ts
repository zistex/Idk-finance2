import { apiRouter } from './routes.js';
import { db, initDatabase, seedInitialData } from './db.js';

// Ensure the database is initialized
initDatabase();

export { apiRouter, db, initDatabase, seedInitialData };
export default apiRouter;
