"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("../db/client");
const validator_1 = require("../services/validator");
const queue_1 = require("../workers/queue");
const router = express_1.default.Router();
// POST indirect submissions (parent/teacher)
router.post('/indirect', async (req, res) => {
    try {
        const payload = req.body;
        const ok = (0, validator_1.validateIndirect)(payload);
        if (!ok)
            return res.status(400).json({ errors: validator_1.validateIndirect.errors });
        const caseId = payload.case_id || payload.caseRef || null;
        const source = payload.source || 'parent';
        const q = await client_1.pool.query(`INSERT INTO indirect_submissions(case_id, source, payload) VALUES($1,$2,$3) RETURNING id`, [caseId, source, JSON.stringify(payload)]);
        await (0, queue_1.enqueueSynthesis)({ caseId, reason: 'indirect_submitted' });
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
        if (!payload.header)
            return res.status(400).json({ error: 'Missing header' });
        const ok = (0, validator_1.validateFba)(payload);
        if (!ok)
            return res.status(400).json({ errors: validator_1.validateFba.errors });
        const header = payload.header;
        const h = await client_1.pool.query(`INSERT INTO header_records(case_id, header) VALUES($1,$2) RETURNING id`, [header.case_ref || header.case_id || null, JSON.stringify(header)]);
        const headerId = h.rows[0].id;
        const toolNames = ['event_recording', 'duration_log', 'latency_log', 'abc_event', 'scatterplot', 'interval_sampling', 'precursor_tracking', 'ioa_log', 'fidelity_checklist', 'pilot_checklist'];
        for (const t of toolNames) {
            if (payload[t]) {
                await client_1.pool.query(`INSERT INTO ${t} (header_id, payload) VALUES($1,$2)`, [headerId, JSON.stringify(payload[t])]).catch((e) => console.warn(`skipped insert table ${t}`, e.message));
            }
        }
        await (0, queue_1.enqueueSynthesis)({ caseId: header.case_ref || header.case_id || null, headerId });
        res.json({ headerId });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'server error' });
    }
});
exports.default = router;
