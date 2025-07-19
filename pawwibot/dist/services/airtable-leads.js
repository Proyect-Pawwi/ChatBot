import fetch from 'node-fetch';
const AIRTABLE_BASE = 'https://api.airtable.com/v0/appOceFmbxh8PfLKT/Leads';
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN || process.env.airtableApiKey;
export async function createLead(fields) {
    const res = await fetch(AIRTABLE_BASE, {
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
export async function getLeads(filterByFormula, maxRecords = 100, view = 'Grid view', offset) {
    const params = new URLSearchParams({
        maxRecords: maxRecords.toString(),
        view,
    });
    if (filterByFormula)
        params.append('filterByFormula', filterByFormula);
    if (offset)
        params.append('offset', offset);
    const url = `${AIRTABLE_BASE}?${params.toString()}`;
    const res = await fetch(url, {
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
export async function getLeadById(recordId) {
    const url = `${AIRTABLE_BASE}/${recordId}`;
    const res = await fetch(url, {
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
export async function updateLead(recordId, fields) {
    const res = await fetch(AIRTABLE_BASE, {
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
export async function deleteLead(recordId) {
    const url = `${AIRTABLE_BASE}/${recordId}`;
    const res = await fetch(url, {
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
//# sourceMappingURL=airtable-leads.js.map