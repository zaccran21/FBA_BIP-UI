import express, { Request, Response } from 'express';
import { pool } from '../db/client.js';
import { enqueuePdf } from '../workers/queue.js';

const router = express.Router();

// PDF render route
router.post('/render/:summaryId', async (req: Request, res: Response) => {
  try {
    const summaryId = req.params.summaryId;
    await enqueuePdf({ summaryId });
    res.json({ message: 'Rendering scheduled' });
  } catch (err) {
    console.error(err);
    res.status(500).send('server error');
  }
});

// Latest summary route
router.get('/summary/:caseId/latest', async (req: Request, res: Response) => {
  try {
    const caseId = req.params.caseId;
    const r = await pool.query(
      `SELECT * FROM aggregated_summaries WHERE case_id=$1 ORDER BY session_number DESC LIMIT 1`,
      [caseId]
    );
    res.json(r.rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).send('server error');
  }
});

// All summaries route
router.get('/summary/:caseId/all', async (req: Request, res: Response) => {
  try {
    const caseId = req.params.caseId;
    const r = await pool.query(
      `SELECT * FROM aggregated_summaries WHERE case_id=$1 ORDER BY session_number ASC`,
      [caseId]
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('server error');
  }
});

// Filtered summaries route
router.get('/summary/:caseId', async (req: Request, res: Response) => {
  try {
    const caseId = req.params.caseId;
    const { observer, behavior } = req.query;

    let query = `SELECT * FROM aggregated_summaries WHERE case_id=$1`;
    const params: any[] = [caseId];

    if (observer) {
      params.push(observer);
      query += ` AND observer_name=$${params.length}`;
    }
    if (behavior) {
      params.push(behavior);
      query += ` AND summary_json->>'behavior'=$${params.length}`;
    }

    query += ` ORDER BY session_number ASC`;

    const r = await pool.query(query, params);
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('server error');
  }
});

export default router;
