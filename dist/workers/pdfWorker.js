"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const puppeteer_1 = __importDefault(require("puppeteer"));
const client_1 = require("../db/client");
const reportBuilder_1 = require("../services/reportBuilder");
const connection = new (require('ioredis'))(process.env.REDIS_URL);
new bullmq_1.Worker('pdf', async (job) => {
    const { summaryId } = job.data;
    const row = (await client_1.pool.query('SELECT * FROM aggregated_summaries WHERE id=$1', [summaryId])).rows[0];
    const html = (0, reportBuilder_1.buildIntegratedReport)({
        case: { student_name: row.case_id },
        metrics: row.summary.headerMetrics?.[0]?.metrics || {},
        themes: row.summary.themes || {},
        synthesisNotes: row.summary.synthesisNotes || ''
    });
    const browser = await puppeteer_1.default.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    // Store as bytea instead of inside jsonb
    await client_1.pool.query('UPDATE aggregated_summaries SET pdf_blob = $1 WHERE id = $2', [pdf, summaryId]);
    return { ok: true };
}, { connection });
