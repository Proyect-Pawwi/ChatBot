import fetch from 'node-fetch';

const AIRTABLE_BASE = 'https://api.airtable.com/v0/appSUDxkkNiojRXta/Completados';
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN || process.env.airtableApiKey;

export interface CompletadoFields {
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
  Pawwer?: string[];
  "metodo Pago"?: string;
  "Nombre cliente": string;
  "Nombre pawwer"?: string;
  "Link Strava"?: string;
}

export interface CompletadoRecord {
  id: string;
  createdTime: string;
  fields: CompletadoFields;
}

export interface CompletadoResponse {
  records: CompletadoRecord[];
  offset?: string;
}

export interface CompletadoDeleteResponse {
  id: string;
  deleted: boolean;
}

// ✅ Crear Completado
export async function createCompletado(fields: CompletadoFields): Promise<CompletadoResponse> {
  const res = await fetch(AIRTABLE_BASE, {
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

  return res.json() as Promise<CompletadoResponse>;
}

// ✅ Obtener Completados
export async function getCompletados(
  filterByFormula?: string,
  maxRecords = 100,
  view = 'Grid view',
  offset?: string
): Promise<CompletadoResponse> {
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

  return res.json() as Promise<CompletadoResponse>;
}

// ✅ Obtener Completado por ID
export async function getCompletadoById(recordId: string): Promise<CompletadoRecord> {
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

  return res.json() as Promise<CompletadoRecord>;
}

// ✅ Actualizar Completado
export async function updateCompletado(recordId: string, fields: Partial<CompletadoFields>): Promise<CompletadoResponse> {
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

  return res.json() as Promise<CompletadoResponse>;
}

// ✅ Eliminar Completado
export async function deleteCompletado(recordId: string): Promise<CompletadoDeleteResponse> {
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

  return res.json() as Promise<CompletadoDeleteResponse>;
}