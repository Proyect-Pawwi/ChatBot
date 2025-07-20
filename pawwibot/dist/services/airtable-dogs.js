"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDog = createDog;
exports.getDogs = getDogs;
exports.updateDog = updateDog;
exports.deleteDog = deleteDog;
const node_fetch_1 = __importDefault(require("node-fetch"));
const AIRTABLE_API_URL = "https://api.airtable.com/v0/appOceFmbxh8PfLKT/Perros";
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || process.env.airtableApiKey;
async function createDog(dog) {
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
    const res = await (0, node_fetch_1.default)(AIRTABLE_API_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    if (!res.ok)
        throw new Error("Airtable create failed");
    return res.json();
}
async function getDogs(filter = "") {
    const url = filter ? `${AIRTABLE_API_URL}?filterByFormula=${encodeURIComponent(filter)}` : AIRTABLE_API_URL;
    const res = await (0, node_fetch_1.default)(url, {
        headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`
        }
    });
    if (!res.ok)
        throw new Error("Airtable get failed");
    return res.json();
}
async function updateDog(recordId, dogFields) {
    const fields = {};
    if (dogFields.Celular !== undefined)
        fields.Celular = dogFields.Celular;
    if (dogFields.Nombre !== undefined)
        fields.Nombre = dogFields.Nombre;
    if (dogFields.Raza !== undefined)
        fields.Raza = dogFields.Raza;
    if (dogFields.Edad !== undefined)
        fields.Edad = dogFields.Edad;
    if (dogFields.Consideraciones !== undefined)
        fields.Consideraciones = dogFields.Consideraciones;
    if (dogFields.Vacunas !== undefined)
        fields.Vacunas = dogFields.Vacunas;
    if (dogFields.Usuario !== undefined)
        fields.Usuario = dogFields.Usuario;
    const payload = {
        records: [{ id: recordId, fields }]
    };
    const res = await (0, node_fetch_1.default)(AIRTABLE_API_URL, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    if (!res.ok)
        throw new Error("Airtable update failed");
    return res.json();
}
async function deleteDog(recordId) {
    const url = `${AIRTABLE_API_URL}/${recordId}`;
    const res = await (0, node_fetch_1.default)(url, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`
        }
    });
    if (!res.ok)
        throw new Error("Airtable delete failed");
    return res.json();
}
//# sourceMappingURL=airtable-dogs.js.map