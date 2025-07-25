import fetch from 'node-fetch';

const AIRTABLE_BASE_PAWWERS = 'https://api.airtable.com/v0/appOceFmbxh8PfLKT/Pawwers%20Activos';
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN || process.env.airtableApiKey;

interface PawwerActivoFields {
  "Nombre completo": string;
  "Cedula de ciudadanía": number;
  "Numero de teléfono": string;
  "Status": string; // Ej: "Activo"
  "Leads"?: string[];
  "Control paseos"?: string;
  "Copia de Control de paseos"?: string[];
}

interface AirtableRecord {
  id: string;
  createdTime: string;
  fields: PawwerActivoFields;
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

// ✅ Crear nuevo pawwer activo
export async function crearPawwerActivo(fields: PawwerActivoFields): Promise<AirtableResponse> {
  const res = await fetch(AIRTABLE_BASE_PAWWERS, {
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
