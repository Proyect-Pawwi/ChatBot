import { google } from 'googleapis';
import path from 'path';
import { JWT } from 'google-auth-library';
import { conversation } from '~/model/models';

const sheets = google.sheets('v4');

async function getSheetClient() {
    const credentialsString = process.env.GOOGLE_CREDENTIALS_JSON;

    if (!credentialsString) {
        throw new Error("❌ GOOGLE_CREDENTIALS_JSON no está definida en las variables de entorno");
    }

    let credentials;
    try {
        credentials = JSON.parse(credentialsString);
    } catch (error) {
        throw new Error("❌ Error al parsear GOOGLE_CREDENTIALS_JSON. Asegúrate de que sea un JSON válido.");
    }

    const auth = new google.auth.JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"]
    });

    return { sheets, authClient: auth };
}


export async function insertClientBasicInfo(client: conversation) {
    try {
        const { sheets, authClient } = await getSheetClient();
        const spreadsheetId = "1blH9C1I4CSf2yJ_8AlM9a0U2wBFh7RSiDYO8-XfKxLQ";

        const dogsAsJson = JSON.stringify(client.dogs || []);

        // ✅ Generar un código promocional sencillo
        const promoCode = `PAWWI-${Math.floor(10000 + Math.random() * 90000)}`;

        // Orden correcto: Cel | CC | Name | Address | Pets | PromoCode
        const values = [[
            client.id,
            client.cc,
            client.name,
            client.address,
            dogsAsJson,
            promoCode  // código promocional
        ]];

        const appendResponse = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: "usersDB!A2",  
            valueInputOption: "RAW",
            insertDataOption: "INSERT_ROWS",
            requestBody: { values },
            auth: authClient
        });

        const updatedRange = appendResponse.data?.updates?.updatedRange;
        if (updatedRange) {
            console.log(`✅ Cliente insertado en rango: ${updatedRange} con promo code: ${promoCode}`);
        }

        return { added: true, promoCode };
    } catch (error) {
        console.error("❌ Error al insertar cliente:", error);
        return { added: false, error };
    }
}


export async function findCelInSheet(cedula: string): Promise<{
    id?: string;
    userData?: string[];
    exists: boolean;
}> {
    try {
        const { sheets, authClient } = await getSheetClient();
        const spreadsheetId = "1blH9C1I4CSf2yJ_8AlM9a0U2wBFh7RSiDYO8-XfKxLQ";
        const range = "usersDB!A1:AA1000";

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
            auth: authClient
        });

        const rows = response.data.values || [];

        for (let i = 1; i < rows.length; i++) {
            if (rows[i][0] === cedula) {
                return {
                    id: cedula,
                    userData: rows[i],
                    exists: true
                };
            }
        }

        return { exists: false };
    } catch (error) {
        console.error("❌ Error al buscar cédula:", error);
        return { exists: false };
    }
}

export async function updateDogsForClient(id: string, newDogsList: { nombre: string, descripcion: string }[]) {
    try {
        const { sheets, authClient } = await getSheetClient();
        const spreadsheetId = "1blH9C1I4CSf2yJ_8AlM9a0U2wBFh7RSiDYO8-XfKxLQ";
        const range = "usersDB!A1:AA1000";

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
            auth: authClient
        });

        const rows = response.data.values || [];

        for (let i = 1; i < rows.length; i++) {
            if (rows[i][0] === id) {
                const updateRange = `usersDB!E${i + 1}`; // E = columna de 'Pets'
                const dogsAsJson = JSON.stringify(newDogsList);

                await sheets.spreadsheets.values.update({
                    spreadsheetId,
                    range: updateRange,
                    valueInputOption: "RAW",
                    requestBody: {
                        values: [[dogsAsJson]]
                    },
                    auth: authClient
                });

                console.log(`✅ Lista de perros actualizada para ${id}`);
                return { updated: true };
            }
        }

        return { updated: false, reason: "Usuario no encontrado" };
    } catch (error) {
        console.error("❌ Error actualizando perros:", error);
        return { updated: false, error };
    }
}

export async function insertLeadRow(conv: conversation) {
    try {
        const { sheets, authClient } = await getSheetClient();
        const spreadsheetId = "1blH9C1I4CSf2yJ_8AlM9a0U2wBFh7RSiDYO8-XfKxLQ";

        const selectedDog = conv.selectedDog!;
        const values = [[
            new Date().toISOString().slice(0, 16).replace('T', ' '),
            conv.id,
            conv.cc,
            conv.name,
            selectedDog.nombre,
            selectedDog.raza,
            selectedDog.edad,
            selectedDog.peso,
            selectedDog.descripcion,
            conv.ciudad,
            conv.localidad,
            conv.barrio,
            conv.address,
            conv.tipoServicio,
            conv.tiempoServicio,
            conv.fechaServicio,
            conv.inicioServicio,
            conv.precio
        ]];

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: "leads",
            valueInputOption: "RAW",
            insertDataOption: "INSERT_ROWS",
            requestBody: { values },
            auth: authClient
        });        

        return { inserted: true };
    } catch (error) {
        console.error("❌ Error al insertar lead:", error);
        return { inserted: false, error };
    }
}
