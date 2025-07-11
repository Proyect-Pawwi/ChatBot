import fetch from "node-fetch";

const AIRTABLE_API_URL = "https://api.airtable.com/v0/appOceFmbxh8PfLKT/Usuarios";
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || process.env.airtableApiKey;


// Campos válidos: Celular, Perros (array de IDs), Agendamientos
export async function createUser(user) {
  const fields = {
    Celular: user.Celular,
    Perros: user.Perros || [],
    Agendamientos: user.Agendamientos
  };
  const payload = {
    records: [
      { fields }
    ]
  };
  const res = await fetch(AIRTABLE_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Airtable create failed");
  return res.json();
}

export async function getUsers(filter = "") {
  const url = filter ? `${AIRTABLE_API_URL}?filterByFormula=${encodeURIComponent(filter)}` : AIRTABLE_API_URL;
  const res = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${AIRTABLE_API_KEY}`
    }
  });
  if (!res.ok) throw new Error("Airtable get failed");
  return res.json();
}


// Solo permite actualizar los campos válidos
type UserFields = {
  Celular?: string;
  Perros?: string[];
  Agendamientos?: any;
};

export async function updateUser(recordId: string, userFields: UserFields) {
  const fields: UserFields = {};
  if (userFields.Celular !== undefined) fields.Celular = userFields.Celular;
  if (userFields.Perros !== undefined) fields.Perros = userFields.Perros;
  if (userFields.Agendamientos !== undefined) fields.Agendamientos = userFields.Agendamientos;
  const payload = {
    records: [
      { id: recordId, fields }
    ]
  };
  const res = await fetch(AIRTABLE_API_URL, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Airtable update failed");
  return res.json();
}

export async function deleteUser(recordId) {
  const url = `${AIRTABLE_API_URL}/${recordId}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${AIRTABLE_API_KEY}`
    }
  });
  if (!res.ok) throw new Error("Airtable delete failed");
  return res.json();
}
