"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const forms_1 = __importDefault(require("./api/forms"));
const reports_1 = __importDefault(require("./api/reports"));
const logger_1 = __importDefault(require("./utils/logger"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors")); // <-- add this
dotenv_1.default.config();
const app = (0, express_1.default)();
// Enable CORS for your frontend origin
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173', // allow your React dev server
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // optional: specify allowed methods
    credentials: true // optional: allow cookies/auth headers
}));
app.use(express_1.default.json({ limit: '5mb' }));
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
app.use('/api/forms', forms_1.default);
app.use('/api/reports', reports_1.default);
const port = process.env.PORT || 3000;
app.listen(port, () => {
    logger_1.default.info(`Server running on port ${port}`);
});
