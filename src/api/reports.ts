import express from 'express';
import { pool } from '../db/client';
import { enqueuePdf } from '../workers/queue';
const router = express.Router();

router.post('/render/:summaryId', async (req, res) => {
  try {
    const summaryId = req.params.summaryId;
    await enqueuePdf({ summaryId });
    res.json({ message: 'Rendering scheduled' });
  } catch (err) {
    console.error(err);
    res.status(500).send('server error');
  }
});

router.get('/summary/:caseId/latest', async (req, res) => {
  try {
    const caseId = req.params.caseId;
    const r = await pool.query(`SELECT * FROM aggregated_summaries WHERE case_id=$1 ORDER BY created_at DESC LIMIT 1`, [caseId]);
    res.json(r.rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).send('server error');
  }
});

export default router;
