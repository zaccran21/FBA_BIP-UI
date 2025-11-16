import { Worker } from 'bullmq';
import { pool } from '../db/client';
import { computeMetricsForHeader, mergeIndirectSummaries } from '../services/metrics';
const connection = new (require('ioredis'))(process.env.REDIS_URL);

new Worker('synthesize', async job => {
  const { caseId, headerId } = job.data;
  
  // Load indirects
  const indirectRes = await pool.query(
    `SELECT payload, source FROM indirect_submissions WHERE case_id=$1 ORDER BY created_at`, 
    [caseId]
  );
  
  // Select recent headers (if headerId provided use that)
  const headers = headerId 
    ? await pool.query(`SELECT * FROM header_records WHERE id=$1`, [headerId]) 
    : await pool.query(`SELECT * FROM header_records WHERE case_id=$1 ORDER BY created_at DESC LIMIT 5`, [caseId]);
  
  const headerRows = headers.rows;
  const metrics = [];
  
  for (const h of headerRows) {
    const headerIdRow = h.id;
    const ev = (await pool.query(`SELECT payload FROM event_recording WHERE header_id=$1`, [headerIdRow])).rows;
    const dur = (await pool.query(`SELECT payload FROM duration_log WHERE header_id=$1`, [headerIdRow])).rows;
    const lat = (await pool.query(`SELECT payload FROM latency_log WHERE header_id=$1`, [headerIdRow])).rows;
    const abc = (await pool.query(`SELECT payload FROM abc_event WHERE header_id=$1`, [headerIdRow])).rows;
    
    const aggregated = computeMetricsForHeader({ 
      header: h.header, 
      eventRows: ev, 
      durationRows: dur, 
      latencyRows: lat, 
      abcRows: abc 
    });
    metrics.push(aggregated);
  }
  
  const indirectPayloads = indirectRes.rows.map(r => ({ source: r.source, payload: r.payload }));
  const integrated = mergeIndirectSummaries({ indirectPayloads, headerMetrics: metrics });
  
  await pool.query(
    `INSERT INTO aggregated_summaries(case_id, summary, level) VALUES($1, $2, $3)
     ON CONFLICT (case_id) DO UPDATE SET summary = $2, level = $3, updated_at = NOW()`,
    [caseId, JSON.stringify(integrated), 'advanced']
  );
  
  return { ok: true };
}, { connection });