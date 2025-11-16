"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const client_1 = require("../db/client");
const metrics_1 = require("../services/metrics");
const connection = new (require('ioredis'))(process.env.REDIS_URL);
new bullmq_1.Worker('synthesize', async (job) => {
    const { caseId, headerId } = job.data;
    // Load indirects
    const indirectRes = await client_1.pool.query(`SELECT payload, source FROM indirect_submissions WHERE case_id=$1 ORDER BY created_at`, [caseId]);
    // Select recent headers (if headerId provided use that)
    const headers = headerId
        ? await client_1.pool.query(`SELECT * FROM header_records WHERE id=$1`, [headerId])
        : await client_1.pool.query(`SELECT * FROM header_records WHERE case_id=$1 ORDER BY created_at DESC LIMIT 5`, [caseId]);
    const headerRows = headers.rows;
    const metrics = [];
    for (const h of headerRows) {
        const headerIdRow = h.id;
        const ev = (await client_1.pool.query(`SELECT payload FROM event_recording WHERE header_id=$1`, [headerIdRow])).rows;
        const dur = (await client_1.pool.query(`SELECT payload FROM duration_log WHERE header_id=$1`, [headerIdRow])).rows;
        const lat = (await client_1.pool.query(`SELECT payload FROM latency_log WHERE header_id=$1`, [headerIdRow])).rows;
        const abc = (await client_1.pool.query(`SELECT payload FROM abc_event WHERE header_id=$1`, [headerIdRow])).rows;
        const aggregated = (0, metrics_1.computeMetricsForHeader)({
            header: h.header,
            eventRows: ev,
            durationRows: dur,
            latencyRows: lat,
            abcRows: abc
        });
        metrics.push(aggregated);
    }
    const indirectPayloads = indirectRes.rows.map(r => ({ source: r.source, payload: r.payload }));
    const integrated = (0, metrics_1.mergeIndirectSummaries)({ indirectPayloads, headerMetrics: metrics });
    await client_1.pool.query(`INSERT INTO aggregated_summaries(case_id, summary, level) VALUES($1, $2, $3)
     ON CONFLICT (case_id) DO UPDATE SET summary = $2, level = $3, updated_at = NOW()`, [caseId, JSON.stringify(integrated), 'advanced']);
    return { ok: true };
}, { connection });
