import express from 'express';
import formsRouter from './api/forms';
import reportsRouter from './api/reports';
import logger from './utils/logger';
import dotenv from 'dotenv';
import cors from 'cors';   // <-- add this

dotenv.config();

const app = express();

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
