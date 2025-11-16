import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import fbaBundle from '../schemas/fba-bundle.schema.json';
import indirectSchema from '../schemas/indirect.schema.json';
const ajv = new Ajv({ allErrors: true, useDefaults: true });
addFormats(ajv);
export const validateFba = ajv.compile(fbaBundle);
export const validateIndirect = ajv.compile(indirectSchema);
