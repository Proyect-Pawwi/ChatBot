import fetch from 'node-fetch';

const AIRTABLE_BASE = 'https://api.airtable.com/v0/appSUDxkkNiojRXta/Leads';
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
  "metodo Pago"?: string;
  "Nombre cliente": string;
  "Nombre completo (from Pawwer)"?: string;
  "Numero de teléfono (from Pawwer)"?: string[];
}

interface AirtableRecord {
  id: string;
  createdTime: string;
  fields: LeadFields;
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

interface AirtableDeleteResponse {
  id: string;
  deleted: boolean;
}

// ✅ Crear Lead
export async function createLead(fields: LeadFields): Promise<AirtableResponse> {
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

  return res.json() as Promise<AirtableResponse>;
}

// ✅ Obtener Leads (con filtro opcional)
export async function getLeads(
  filterByFormula?: string,
  maxRecords = 100,
  view = 'Grid view',
  offset?: string
): Promise<AirtableResponse> {
  const params = new URLSearchParams({
    maxRecords: maxRecords.toString(),
    view,
  });
  if (filterByFormula) params.append('filterByFormula', filterByFormula);
  if (offset) params.append('offset', offset);

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

  return res.json() as Promise<AirtableResponse>;
}

// ✅ Obtener Lead por ID (nuevo)
export async function getLeadById(recordId: string): Promise<AirtableRecord> {
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

  return res.json() as Promise<AirtableRecord>;
}

// ✅ Actualizar Lead
export async function updateLead(recordId: string, fields: Partial<LeadFields>): Promise<AirtableResponse> {
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

  return res.json() as Promise<AirtableResponse>;
}

// ✅ Eliminar Lead
export async function deleteLead(recordId: string): Promise<AirtableDeleteResponse> {
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

  return res.json() as Promise<AirtableDeleteResponse>;
}