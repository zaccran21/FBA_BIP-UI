"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    info: (...args) => console.log('[INFO]', ...args),
    warn: (...args) => console.warn('[WARN]', ...args),
    error: (...args) => console.error('[ERROR]', ...args)
};
