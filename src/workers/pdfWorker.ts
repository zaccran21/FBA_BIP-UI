import { Worker } from 'bullmq';
import puppeteer from 'puppeteer';
import { pool } from '../db/client';
import { buildIntegratedReport } from '../services/reportBuilder';
const connection = new (require('ioredis'))(process.env.REDIS_URL);

new Worker('pdf', async job => {
  const { summaryId } = job.data;
  const row = (await pool.query('SELECT * FROM aggregated_summaries WHERE id=$1', [summaryId])).rows[0];
  
  const html = buildIntegratedReport({ 
    case: { student_name: row.case_id }, 
    metrics: row.summary.headerMetrics?.[0]?.metrics || {}, 
    themes: row.summary.themes || {}, 
    synthesisNotes: row.summary.synthesisNotes || '' 
  });
  
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();
  
  // Store as bytea instead of inside jsonb
  await pool.query(
    'UPDATE aggregated_summaries SET pdf_blob = $1 WHERE id = $2', 
    [pdf, summaryId]
  );
  
  return { ok: true };
}, { connection });