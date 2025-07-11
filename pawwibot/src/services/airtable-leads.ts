import fetch from 'node-fetch';

const AIRTABLE_BASE = 'https://api.airtable.com/v0/appOceFmbxh8PfLKT/Leads';
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN || process.env.airtableApiKey;

interface LeadFields {
  FechaCreacion: string;
  Celular: string;
  Perro: string;
  Anotaciones?: string;
  Direccion: string;
  TipoServicio: string;
  TiempoServicio: string;
  Fecha: string;
  Hora: string;
  Precio: number;
  Estado?: string;
  Pawwer?: string;
}

export async function createLead(fields: LeadFields) {
  const res = await fetch(AIRTABLE_BASE, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      records: [
        { fields }
      ]
    })
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Airtable error: ${error}`);
  }
  return res.json();
}

export async function getLeads(filterByFormula?: string) {
  const url = filterByFormula ? `${AIRTABLE_BASE}?filterByFormula=${encodeURIComponent(filterByFormula)}` : AIRTABLE_BASE;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    }
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Airtable error: ${error}`);
  }
  return res.json();
}

export async function updateLead(recordId: string, fields: Partial<LeadFields>) {
  const res = await fetch(AIRTABLE_BASE, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      records: [
        { id: recordId, fields }
      ]
    })
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Airtable error: ${error}`);
  }
  return res.json();
}

export async function deleteLead(recordId: string) {
  const url = `${AIRTABLE_BASE}/${recordId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    }
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Airtable error: ${error}`);
  }
  return res.json();
}
