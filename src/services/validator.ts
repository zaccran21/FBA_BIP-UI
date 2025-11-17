import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to load JSON schema files manually
function loadSchema(fileName: string) {
  const filePath = path.resolve(__dirname, '../schemas', fileName);
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

// Load schemas
const fbaBundle = loadSchema('fba-bundle.schema.json');
const indirectSchema = loadSchema('indirect.schema.json');

// Initialize AJV
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// Compile validators
export const validateFba = ajv.compile(fbaBundle);
export const validateIndirect = ajv.compile(indirectSchema);
