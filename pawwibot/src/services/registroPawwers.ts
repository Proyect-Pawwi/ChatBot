import fetch from 'node-fetch';

const AIRTABLE_BASE_PASO4 = 'https://api.airtable.com/v0/appZrLlSY1XfOq4xs/Paso%204';
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN || process.env.airtableApiKey;

interface Paso4Fields {
  "Nombre": string;
  "Correo": string;
  "Telefono": string;
  "Cedula": number;
  "¿Aceptas los términos y condiciones establecidos en el contrato?": boolean;
  "¿Autorizas el tratamiento de tus datos personales según la Ley 1581 de 2012?": boolean;
  "¿Has leído y entendido el contrato civil de prestación de servicios?": boolean;
  "Activar"?: string;
}

interface AirtableRecordPaso4 {
  id: string;
  createdTime: string;
  fields: Paso4Fields;
}

interface AirtableResponsePaso4 {
  records: AirtableRecordPaso4[];
  offset?: string;
}

interface AirtableDeleteResponse {
  id: string;
  deleted: boolean;
}

// ✅ Crear registro en Paso 4
export async function createPaso4(fields: Paso4Fields): Promise<AirtableResponsePaso4> {
  const res = await fetch(AIRTABLE_BASE_PASO4, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
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

  return res.json() as Promise<AirtableResponsePaso4>;
}

// ✅ Obtener registros de Paso 4 (con filtro opcional)
export async function getPaso4(
  filterByFormula?: string,
  maxRecords = 100,
  view = 'Grid view',
  offset?: string
): Promise<AirtableResponsePaso4> {
  const params = new URLSearchParams({
    maxRecords: maxRecords.toString(),
    view,
  });
  if (filterByFormula) params.append('filterByFormula', filterByFormula);
  if (offset) params.append('offset', offset);

  const url = `${AIRTABLE_BASE_PASO4}?${params.toString()}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Airtable error: ${error}`);
  }

  return res.json() as Promise<AirtableResponsePaso4>;
}

// ✅ Obtener registro de Paso 4 por ID
export async function getPaso4ById(recordId: string): Promise<AirtableRecordPaso4> {
  const url = `${AIRTABLE_BASE_PASO4}/${recordId}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Airtable error: ${error}`);
  }

  return res.json() as Promise<AirtableRecordPaso4>;
}

// ✅ Actualizar registro de Paso 4
export async function updatePaso4(recordId: string, fields: Partial<Paso4Fields>): Promise<AirtableResponsePaso4> {
  const res = await fetch(AIRTABLE_BASE_PASO4, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
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

  return res.json() as Promise<AirtableResponsePaso4>;
}

// ✅ Eliminar registro de Paso 4
export async function deletePaso4(recordId: string): Promise<AirtableDeleteResponse> {
  const url = `${AIRTABLE_BASE_PASO4}/${recordId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Airtable error: ${error}`);
  }

  return res.json() as Promise<AirtableDeleteResponse>;
}
