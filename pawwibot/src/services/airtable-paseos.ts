import fetch from 'node-fetch';

const AIRTABLE_BASE_PASEOS = 'https://api.airtable.com/v0/appZrLlSY1XfOq4xs/Paso%201';
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN || process.env.airtableApiKey;

interface PaseoFields {
  FechaCreacion: string;
  Celular: string;
  Perro: string;
  Anotaciones?: string;
  Direccion: string;
  TipoServicio: string;
  TiempoServicio: string;
  Fecha: string;
  Precio: number;
  Estado?: string;
  Pawwer?: string[];
  Hora: string;
  "metodo Pago"?: string;
  "Numero de teléfono (from Pawwer)"?: string[];
  "Link Strava"?: string;
  "Nombre cliente"?: string;
  "Nombre completo (from Pawwer)"?: string;
}

interface AirtableRecordPaseo {
  id: string;
  createdTime: string;
  fields: PaseoFields;
}

interface AirtableResponsePaseo {
  records: AirtableRecordPaseo[];
  offset?: string;
}

interface AirtableDeleteResponse {
  id: string;
  deleted: boolean;
}

// Crear Paseo
export async function createPaseo(fields: PaseoFields): Promise<AirtableResponsePaseo> {
  const res = await fetch(AIRTABLE_BASE_PASEOS, {
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

  return res.json() as Promise<AirtableResponsePaseo>;
}

// Obtener paseos (con filtro opcional)
export async function getPaseos(
  filterByFormula?: string,
  maxRecords = 100,
  view = 'Grid view',
  offset?: string
): Promise<AirtableResponsePaseo> {
  const params = new URLSearchParams({
    maxRecords: maxRecords.toString(),
    view,
  });
  if (filterByFormula) params.append('filterByFormula', filterByFormula);
  if (offset) params.append('offset', offset);

  const url = `${AIRTABLE_BASE_PASEOS}?${params.toString()}`;
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

  return res.json() as Promise<AirtableResponsePaseo>;
}

export async function getPaseoByPawwerTelefono(pawwerTelefono: string): Promise<AirtableRecordPaseo | null> {
  const formula = `AND(SEARCH('${pawwerTelefono}', ARRAYJOIN({Numero de teléfono (from Pawwer)})), {Estado} = 'Esperando Pawwer')`;

  const res = await getPaseos(formula, 1); // Solo necesitas uno

  if (res.records.length === 0) {
    console.log("❌ No se encontró un paseo con ese número y estado 'Esperando Pawwer'");
    return null;
  }

  const paseo = res.records[0];
  console.log("✅ Paseo encontrado:", paseo.id);
  return paseo;
}

export async function getPaseoByPawwerTelefonoActive(pawwerTelefono: string): Promise<AirtableRecordPaseo | null> {
  // La fórmula Airtable para buscar registros donde:
  // - El número está en "Numero de teléfono (from Pawwer)"
  // - El Estado NO es "Finalizado"
  // - El Estado NO es "Cancelado"
  // Es decir, los paseos activos o en proceso.
  const formula = `AND(
    SEARCH('${pawwerTelefono}', ARRAYJOIN({Numero de teléfono (from Pawwer)})),
    NOT({Estado} = 'Finalizado'),
    NOT({Estado} = 'Cancelado')
  )`;

  const res = await getPaseos(formula, 1); // Solo uno, el primero que cumpla

  if (res.records.length === 0) {
    console.log("❌ No se encontró un paseo activo para ese Pawwer");
    return null;
  }

  const paseo = res.records[0];
  console.log("✅ Paseo activo encontrado:", paseo.id);
  return paseo;
}



// Obtener Paseo por ID
export async function getPaseoById(recordId: string): Promise<AirtableRecordPaseo> {
  const url = `${AIRTABLE_BASE_PASEOS}/${recordId}`;
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

  return res.json() as Promise<AirtableRecordPaseo>;
}

// Actualizar Paseo
export async function updatePaseo(recordId: string, fields: Partial<PaseoFields>): Promise<AirtableResponsePaseo> {
  const res = await fetch(AIRTABLE_BASE_PASEOS, {
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

  return res.json() as Promise<AirtableResponsePaseo>;
}

// Eliminar Paseo
export async function deletePaseo(recordId: string): Promise<AirtableDeleteResponse> {
  const url = `${AIRTABLE_BASE_PASEOS}/${recordId}`;
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