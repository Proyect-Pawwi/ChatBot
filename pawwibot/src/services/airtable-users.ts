import fetch from "node-fetch";

const AIRTABLE_API_URL = "https://api.airtable.com/v0/appOceFmbxh8PfLKT/Usuarios";
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || process.env.airtableApiKey;

type User = {
  Celular: string;
  Perros?: string[];
  Agendamientos?: any;  // Puedes definir un tipo más preciso si tienes estructura
  Direccion?: string;
};

export async function createUser(user: User) {
  const fields = {
    Celular: user.Celular,
    Perros: user.Perros || [],
    Agendamientos: user.Agendamientos,
    Direccion: user.Direccion || "",
  };
  const payload = {
    records: [{ fields }]
  };
  const res = await fetch(AIRTABLE_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
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
      Authorization: `Bearer ${AIRTABLE_API_KEY}`
    }
  });
  if (!res.ok) throw new Error("Airtable get failed");
  return res.json();
}

type UserFields = {
  Celular?: string;
  Perros?: string[];
  Agendamientos?: any;
  Direccion?: string;
};

export async function updateUser(recordId: string, userFields: UserFields) {
  const fields: UserFields = {};
  if (userFields.Celular !== undefined) fields.Celular = userFields.Celular;
  if (userFields.Perros !== undefined) fields.Perros = userFields.Perros;
  if (userFields.Agendamientos !== undefined) fields.Agendamientos = userFields.Agendamientos;
  if (userFields.Direccion !== undefined) fields.Direccion = userFields.Direccion;

  const payload = {
    records: [{ id: recordId, fields }]
  };
  const res = await fetch(AIRTABLE_API_URL, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Airtable update failed");
  return res.json();
}

export async function deleteUser(recordId: string) {
  const url = `${AIRTABLE_API_URL}/${recordId}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`
    }
  });
  if (!res.ok) throw new Error("Airtable delete failed");
  return res.json();
}
