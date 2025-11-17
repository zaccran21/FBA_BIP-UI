import express from 'express';
import formsRouter from './api/forms.js';
import reportsRouter from './api/reports.js';
import logger from './utils/logger.js';
import dotenv from 'dotenv';
import cors from 'cors';   // <-- add this

dotenv.config();

const app = express();
app.use(express.json());

// healthcheck route
app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});
// Enable CORS for your frontend origin
app.use(cors({
  origin: 'http://localhost:5173',   // allow your React dev server
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // optional: specify allowed methods
  credentials: true                  // optional: allow cookies/auth headers
}));

app.use(express.json({ limit: '5mb' }));

// Add home route
app.get('/', (req, res) => {
  res.json({ 
    message: 'FBA Direct Measure API',
    version: '0.1.0',
    endpoints: {
      indirect: 'POST /api/forms/indirect',
      direct: 'POST /api/forms/direct',
      reports: 'GET /api/reports/:summaryId'
    },
    status: 'running'
  });
});

app.use('/api/forms', formsRouter);
app.use('/api/reports', reportsRouter);

const port = Number(process.env.PORT) || 3000;

app.listen(port, '0.0.0.0', () => {
  logger.info(`Server running on port ${port}`);
});
