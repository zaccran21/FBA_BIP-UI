"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateIndirect = exports.validateFba = void 0;
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const fba_bundle_schema_json_1 = __importDefault(require("../schemas/fba-bundle.schema.json"));
const indirect_schema_json_1 = __importDefault(require("../schemas/indirect.schema.json"));
const ajv = new ajv_1.default({ allErrors: true, useDefaults: true });
(0, ajv_formats_1.default)(ajv);
exports.validateFba = ajv.compile(fba_bundle_schema_json_1.default);
exports.validateIndirect = ajv.compile(indirect_schema_json_1.default);
