import { Router } from 'express';
import { sql } from 'drizzle-orm';
import { db } from './server/db'; // adjust path

const router = Router();

router.get('/health', async (_req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.status(200).send('OK');
  } catch {
    res.status(500).send('Database not reachable');
  }
});

export default router;