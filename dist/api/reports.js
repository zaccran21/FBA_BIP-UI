"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("../db/client");
const queue_1 = require("../workers/queue");
const router = express_1.default.Router();
router.post('/render/:summaryId', async (req, res) => {
    try {
        const summaryId = req.params.summaryId;
        await (0, queue_1.enqueuePdf)({ summaryId });
        res.json({ message: 'Rendering scheduled' });
    }
    catch (err) {
        console.error(err);
        res.status(500).send('server error');
    }
});
router.get('/summary/:caseId/latest', async (req, res) => {
    try {
        const caseId = req.params.caseId;
        const r = await client_1.pool.query(`SELECT * FROM aggregated_summaries WHERE case_id=$1 ORDER BY created_at DESC LIMIT 1`, [caseId]);
        res.json(r.rows[0] || null);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('server error');
    }
});
exports.default = router;
