"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.getUsers = getUsers;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
const node_fetch_1 = __importDefault(require("node-fetch"));
const AIRTABLE_API_URL = "https://api.airtable.com/v0/appOceFmbxh8PfLKT/Usuarios";
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || process.env.airtableApiKey;
async function createUser(user) {
    const fields = {
        Celular: user.Celular,
        Perros: user.Perros || [],
        Agendamientos: user.Agendamientos,
        Direccion: user.Direccion || "",
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
async function getUsers(filter = "") {
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
async function updateUser(recordId, userFields) {
    const fields = {};
    if (userFields.Celular !== undefined)
        fields.Celular = userFields.Celular;
    if (userFields.Perros !== undefined)
        fields.Perros = userFields.Perros;
    if (userFields.Agendamientos !== undefined)
        fields.Agendamientos = userFields.Agendamientos;
    if (userFields.Direccion !== undefined)
        fields.Direccion = userFields.Direccion;
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
async function deleteUser(recordId) {
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
//# sourceMappingURL=airtable-users.js.map