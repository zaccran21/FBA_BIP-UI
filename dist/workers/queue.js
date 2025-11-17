import { Queue } from 'bullmq';
import IORedis from 'ioredis';
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
export const synthQueue = new Queue('synthesize', { connection });
export const pdfQueue = new Queue('pdf', { connection });
export async function enqueueSynthesis(jobData) {
    await synthQueue.add('synthesize-job', jobData, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
}
export async function enqueuePdf(jobData) {
    await pdfQueue.add('render-pdf-job', jobData, { attempts: 2, backoff: { type: 'exponential', delay: 1000 } });
}
