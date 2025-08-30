import fetch from "node-fetch";

const AIRTABLE_BASE_CONTRATO =
  "https://api.airtable.com/v0/appZrLlSY1XfOq4xs/Contrato";
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN || process.env.airtableApiKey;

interface ContratoFields {
  Nombre: string;
  Correo: string;
  Telefono: string;
  Cedula: number;
  "¿Aceptas los términos y condiciones establecidos en el contrato?": boolean;
  "¿Autorizas el tratamiento de tus datos personales según la Ley 1581 de 2012?": boolean;
  "¿Has leído y entendido el contrato civil de prestación de servicios?": boolean;
  Activar?: string;
}

interface AirtableRecordContrato {
  id: string;
  createdTime: string;
  fields: ContratoFields;
}

interface AirtableResponseContrato {
  records: AirtableRecordContrato[];
  offset?: string;
}

interface AirtableDeleteResponse {
  id: string;
  deleted: boolean;
}

// ✅ Crear registro en Contrato
export async function createContrato(
  fields: ContratoFields
): Promise<AirtableRecordContrato> {
  const res = await fetch(AIRTABLE_BASE_CONTRATO, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Airtable error: ${error}`);
  }

  return res.json() as Promise<AirtableRecordContrato>;
}

// ✅ Obtener registros de Contrato (con filtro opcional)
export async function getContrato(
  filterByFormula?: string,
  maxRecords = 100,
  view = "Grid view",
  offset?: string
): Promise<AirtableResponseContrato> {
  const params = new URLSearchParams({
    maxRecords: maxRecords.toString(),
    view,
  });
  if (filterByFormula) params.append("filterByFormula", filterByFormula);
  if (offset) params.append("offset", offset);

  const url = `${AIRTABLE_BASE_CONTRATO}?${params.toString()}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Airtable error: ${error}`);
  }

  return res.json() as Promise<AirtableResponseContrato>;
}

// ✅ Obtener registro de Contrato por ID
export async function getContratoById(
  recordId: string
): Promise<AirtableRecordContrato> {
  const url = `${AIRTABLE_BASE_CONTRATO}/${recordId}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Airtable error: ${error}`);
  }

  return res.json() as Promise<AirtableRecordContrato>;
}

// ✅ Actualizar registro de Contrato
export async function updateContrato(
  recordId: string,
  fields: Partial<ContratoFields>
): Promise<AirtableRecordContrato> {
  const url = `${AIRTABLE_BASE_CONTRATO}/${recordId}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Airtable error: ${error}`);
  }

  return res.json() as Promise<AirtableRecordContrato>;
}

// ✅ Eliminar registro de Contrato
export async function deleteContrato(
  recordId: string
): Promise<AirtableDeleteResponse> {
  const url = `${AIRTABLE_BASE_CONTRATO}/${recordId}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Airtable error: ${error}`);
  }

  return res.json() as Promise<AirtableDeleteResponse>;
}
