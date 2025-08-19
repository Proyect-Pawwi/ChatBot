import fetch from 'node-fetch';

const AIRTABLE_BASE_CONTRATOS = 'https://api.airtable.com/v0/appZrLlSY1XfOq4xs/Paso%201';
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN || process.env.airtableApiKey;

interface ContratoFields {
  "Nombre completo": string;
  "Número de cédula": number;
  "Correo electrónico": string;
  "Número de teléfono": string;
  "¿Aceptas los términos y condiciones establecidos en el contrato?": boolean;
  "¿Autorizas el tratamiento de tus datos personales según la Ley 1581 de 2012?": boolean;
  "¿Has leído y entendido el contrato civil de prestación de servicios?": boolean;
  "Última modificación"?: string;
  "Activar Pawwer"?: string;
}

interface AirtableRecord {
  id: string;
  createdTime: string;
  fields: ContratoFields;
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

interface AirtableDeleteResponse {
  id: string;
  deleted: boolean;
}

// ✅ Crear Contrato
export async function createContratoAceptado(fields: ContratoFields): Promise<AirtableResponse> {
  const res = await fetch(AIRTABLE_BASE_CONTRATOS, {
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

  return res.json() as Promise<AirtableResponse>;
}

// ✅ Obtener Contratos (con filtro opcional)
export async function getContratosAceptados(
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

  const url = `${AIRTABLE_BASE_CONTRATOS}?${params.toString()}`;
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

  return res.json() as Promise<AirtableResponse>;
}

// ✅ Obtener Contrato por ID
export async function getContratoById(recordId: string): Promise<AirtableRecord> {
  const url = `${AIRTABLE_BASE_CONTRATOS}/${recordId}`;
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

  return res.json() as Promise<AirtableRecord>;
}

// ✅ Actualizar Contrato
export async function updateContratoAceptado(recordId: string, fields: Partial<ContratoFields>): Promise<AirtableResponse> {
  const res = await fetch(AIRTABLE_BASE_CONTRATOS, {
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

  return res.json() as Promise<AirtableResponse>;
}

// ✅ Eliminar Contrato
export async function deleteContratoAceptado(recordId: string): Promise<AirtableDeleteResponse> {
  const url = `${AIRTABLE_BASE_CONTRATOS}/${recordId}`;
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
