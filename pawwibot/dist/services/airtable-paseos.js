"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaseo = createPaseo;
exports.getPaseos = getPaseos;
exports.getPaseoByPawwerTelefono = getPaseoByPawwerTelefono;
exports.getPaseoByPawwerTelefonoActive = getPaseoByPawwerTelefonoActive;
exports.getPaseoById = getPaseoById;
exports.updatePaseo = updatePaseo;
exports.deletePaseo = deletePaseo;
const node_fetch_1 = __importDefault(require("node-fetch"));
const AIRTABLE_BASE_PASEOS = 'https://api.airtable.com/v0/appOceFmbxh8PfLKT/Control%20de%20paseos';
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN || process.env.airtableApiKey;
async function createPaseo(fields) {
    const res = await (0, node_fetch_1.default)(AIRTABLE_BASE_PASEOS, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            records: [{ fields }],
        }),
    });
    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Airtable error: ${error}`);
    }
    return res.json();
}
async function getPaseos(filterByFormula, maxRecords = 100, view = 'Grid view', offset) {
    const params = new URLSearchParams({
        maxRecords: maxRecords.toString(),
        view,
    });
    if (filterByFormula)
        params.append('filterByFormula', filterByFormula);
    if (offset)
        params.append('offset', offset);
    const url = `${AIRTABLE_BASE_PASEOS}?${params.toString()}`;
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
async function getPaseoByPawwerTelefono(pawwerTelefono) {
    const formula = `AND(SEARCH('${pawwerTelefono}', ARRAYJOIN({Numero de teléfono (from Pawwer)})), {Estado} = 'Esperando Pawwer')`;
    const res = await getPaseos(formula, 1);
    if (res.records.length === 0) {
        console.log("❌ No se encontró un paseo con ese número y estado 'Esperando Pawwer'");
        return null;
    }
    const paseo = res.records[0];
    console.log("✅ Paseo encontrado:", paseo.id);
    return paseo;
}
async function getPaseoByPawwerTelefonoActive(pawwerTelefono) {
    const formula = `AND(
    SEARCH('${pawwerTelefono}', ARRAYJOIN({Numero de teléfono (from Pawwer)})),
    NOT({Estado} = 'Finalizado'),
    NOT({Estado} = 'Cancelado')
  )`;
    const res = await getPaseos(formula, 1);
    if (res.records.length === 0) {
        console.log("❌ No se encontró un paseo activo para ese Pawwer");
        return null;
    }
    const paseo = res.records[0];
    console.log("✅ Paseo activo encontrado:", paseo.id);
    return paseo;
}
async function getPaseoById(recordId) {
    const url = `${AIRTABLE_BASE_PASEOS}/${recordId}`;
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
async function updatePaseo(recordId, fields) {
    const res = await (0, node_fetch_1.default)(AIRTABLE_BASE_PASEOS, {
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
async function deletePaseo(recordId) {
    const url = `${AIRTABLE_BASE_PASEOS}/${recordId}`;
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
//# sourceMappingURL=airtable-paseos.js.map