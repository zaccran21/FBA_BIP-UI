"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pdfQueue = exports.synthQueue = void 0;
exports.enqueueSynthesis = enqueueSynthesis;
exports.enqueuePdf = enqueuePdf;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const connection = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379');
exports.synthQueue = new bullmq_1.Queue('synthesize', { connection });
exports.pdfQueue = new bullmq_1.Queue('pdf', { connection });
async function enqueueSynthesis(jobData) {
    await exports.synthQueue.add('synthesize-job', jobData, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
}
async function enqueuePdf(jobData) {
    await exports.pdfQueue.add('render-pdf-job', jobData, { attempts: 2, backoff: { type: 'exponential', delay: 1000 } });
}
