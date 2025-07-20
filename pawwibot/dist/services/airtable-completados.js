"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompletado = createCompletado;
exports.getCompletados = getCompletados;
exports.getCompletadoById = getCompletadoById;
exports.updateCompletado = updateCompletado;
exports.deleteCompletado = deleteCompletado;
const node_fetch_1 = __importDefault(require("node-fetch"));
const AIRTABLE_BASE = 'https://api.airtable.com/v0/appOceFmbxh8PfLKT/Completados';
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN || process.env.airtableApiKey;
async function createCompletado(fields) {
    const res = await (0, node_fetch_1.default)(AIRTABLE_BASE, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records: [{ fields }] }),
    });
    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Airtable error: ${error}`);
    }
    return res.json();
}
async function getCompletados(filterByFormula, maxRecords = 100, view = 'Grid view', offset) {
    const params = new URLSearchParams({
        maxRecords: maxRecords.toString(),
        view,
    });
    if (filterByFormula)
        params.append('filterByFormula', filterByFormula);
    if (offset)
        params.append('offset', offset);
    const url = `${AIRTABLE_BASE}?${params.toString()}`;
    const res = await (0, node_fetch_1.default)(url, {
        headers: {
            'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Airtable error: ${error}`);
    }
    return res.json();
}
async function getCompletadoById(recordId) {
    const url = `${AIRTABLE_BASE}/${recordId}`;
    const res = await (0, node_fetch_1.default)(url, {
        headers: {
            'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Airtable error: ${error}`);
    }
    return res.json();
}
async function updateCompletado(recordId, fields) {
    const res = await (0, node_fetch_1.default)(AIRTABLE_BASE, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            records: [{ id: recordId, fields }],
        }),
    });
    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Airtable error: ${error}`);
    }
    return res.json();
}
async function deleteCompletado(recordId) {
    const url = `${AIRTABLE_BASE}/${recordId}`;
    const res = await (0, node_fetch_1.default)(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Airtable error: ${error}`);
    }
    return res.json();
}
//# sourceMappingURL=airtable-completados.js.map