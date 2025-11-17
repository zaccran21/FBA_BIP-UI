import express from 'express';
import { pool } from '../db/client.js';
import { validateFba, validateIndirect } from '../services/validator.js';
import { enqueueSynthesis } from '../workers/queue.js';
const router = express.Router();
// POST indirect submissions (parent/teacher)
router.post('/indirect', async (req, res) => {
    try {
        const payload = req.body;
        const ok = validateIndirect(payload);
        if (!ok) {
            return res.status(400).json({ errors: validateIndirect.errors });
        }
        const caseId = payload.case_id || payload.caseRef || null;
        const source = payload.source || 'parent';
        const q = await pool.query(`INSERT INTO indirect_submissions(case_id, source, payload) VALUES($1,$2,$3) RETURNING id`, [caseId, source, JSON.stringify(payload)]);
        await enqueueSynthesis({ caseId, reason: 'indirect_submitted' });
        res.json({ id: q.rows[0].id });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'server error' });
    }
});
// POST direct payload (header + tool payloads)
router.post('/direct', async (req, res) => {
    try {
        const payload = req.body;
        if (!payload.header) {
            return res.status(400).json({ error: 'Missing header' });
        }
        const ok = validateFba(payload);
        if (!ok) {
            return res.status(400).json({ errors: validateFba.errors });
        }
        const header = payload.header;
        const caseId = header.case_ref || header.case_id || null;
        const h = await pool.query(`INSERT INTO header_records(case_id, header) VALUES($1,$2) RETURNING id`, [caseId, JSON.stringify(header)]);
        const headerId = h.rows[0].id;
        const toolNames = [
            'event_recording',
            'duration_log',
            'latency_log',
            'abc_event',
            'scatterplot',
            'interval_sampling',
            'precursor_tracking',
            'ioa_log',
            'fidelity_checklist',
            'pilot_checklist'
        ];
        for (const t of toolNames) {
            if (payload[t]) {
                await pool
                    .query(`INSERT INTO ${t} (header_id, payload) VALUES($1,$2)`, [headerId, JSON.stringify(payload[t])])
                    .catch((e) => console.warn(`skipped insert table ${t}`, e.message));
            }
        }
        await enqueueSynthesis({ caseId, headerId });
        res.json({ headerId });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'server error' });
    }
});
export default router;
