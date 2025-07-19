import fetch from "node-fetch";

const AIRTABLE_API_URL = "https://api.airtable.com/v0/appOceFmbxh8PfLKT/Perros";
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || process.env.airtableApiKey;

type Dog = {
  Celular: string;
  Nombre: string;
  Raza: string;
  Edad: string;
  Consideraciones: string;
  Vacunas: string;
  Usuario?: string[];
};

// Crear perro con tipo explícito
export async function createDog(dog: Dog) {
  const fields = {
    Celular: dog.Celular,
    Nombre: dog.Nombre,
    Raza: dog.Raza,
    Edad: dog.Edad,
    Consideraciones: dog.Consideraciones,
    Vacunas: dog.Vacunas,
    Usuario: dog.Usuario || []
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

export async function getDogs(filter = "") {
  const url = filter ? `${AIRTABLE_API_URL}?filterByFormula=${encodeURIComponent(filter)}` : AIRTABLE_API_URL;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`
    }
  });
  if (!res.ok) throw new Error("Airtable get failed");
  return res.json();
}

type DogFields = {
  Celular?: string;
  Nombre?: string;
  Raza?: string;
  Edad?: string;
  Consideraciones?: string;
  Vacunas?: string;
  Usuario?: string[];
};

export async function updateDog(recordId: string, dogFields: DogFields) {
  const fields: Partial<DogFields> = {};
  if (dogFields.Celular !== undefined) fields.Celular = dogFields.Celular;
  if (dogFields.Nombre !== undefined) fields.Nombre = dogFields.Nombre;
  if (dogFields.Raza !== undefined) fields.Raza = dogFields.Raza;
  if (dogFields.Edad !== undefined) fields.Edad = dogFields.Edad;
  if (dogFields.Consideraciones !== undefined) fields.Consideraciones = dogFields.Consideraciones;
  if (dogFields.Vacunas !== undefined) fields.Vacunas = dogFields.Vacunas;
  if (dogFields.Usuario !== undefined) fields.Usuario = dogFields.Usuario;

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

// Aquí sí declara que recordId es string para evitar el error TS
export async function deleteDog(recordId: string) {
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
