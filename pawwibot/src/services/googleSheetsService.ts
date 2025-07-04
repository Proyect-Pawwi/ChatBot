/**
 * Busca en la hoja de leads si hay alguna fila en la columna S (índice 18) con el valor 'Por realizar'.
 * Si la fecha (columna U, índice 20) y la hora (columna V, índice 21) indican que falta menos de una hora para el paseo (hora Colombia),
 * manda un mensaje de alerta con sendAdminNotification.
 */
export async function notifyUpcomingWalks() {
    try {
        const { sheets, authClient } = await getSheetClient();
        const spreadsheetId = "1blH9C1I4CSf2yJ_8AlM9a0U2wBFh7RSiDYO8-XfKxLQ";
        const range = "leads!A2:Z1000";

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
            auth: authClient
        });

        const rows = response.data.values || [];
        const now = new Date();
        // Hora Colombia
        const nowColombia = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" }));

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (row[18] && row[18].toLowerCase() === 'por realizar') {
                const dateStr = row[20] ? row[20].toString().trim() : '';
                const hourStr = row[21] ? row[21].toString().trim() : '';
                // Unir fecha y hora
                let dateTimeStr = '';
                let dateTime;
                if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
                    // DD/MM/YYYY
                    const [d, m, y] = dateStr.split('/');
                    dateTimeStr = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T${hourStr}:00-05:00`;
                } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                    // YYYY-MM-DD
                    dateTimeStr = `${dateStr}T${hourStr}:00-05:00`;
                }
                if (dateTimeStr) {
                    dateTime = new Date(dateTimeStr);
                    // Diferencia en minutos
                    const diffMs = dateTime.getTime() - nowColombia.getTime();
                    const diffMin = diffMs / 60000;
                    if (diffMin > 0 && diffMin <= 60) {
                        // Notificar admin
                        const cliente = row[2] || '-';
                        const nombre = row[3] || '-';
                        const perro = row[4] || '-';
                        const direccion = row[12] || '-';
                        const msg = `ALERTA: Paseo en menos de 1 hora\nCliente: ${cliente}\nNombre: ${nombre}\nPerro: ${perro}\nDirección: ${direccion}\nFecha: ${dateStr}\nHora: ${hourStr}`;
                        await sendAdminNotification('573023835142', msg);
                    }
                }
            }
        }
    } catch (error) {
        console.error("❌ Error en notifyUpcomingWalks:", error);
    }
}
/**
 * Busca en la hoja de leads si hay alguna fila en la columna S (índice 18) con el valor 'Confirmado'.
 * Si la encuentra, cambia ese valor a 'Por realizar' y retorna el valor de la celda T (índice 19) de esa fila.
 * Si no encuentra ninguna, retorna null.
 * @returns {Promise<string|null>} El valor de la celda T si se hizo el cambio, o null si no se encontró.
 */
import { sendAdminNotification } from "~/services/messageService";

export async function updateFirstConfirmedLeadAndGetT(): Promise<string | null> {
    try {
        const { sheets, authClient } = await getSheetClient();
        const spreadsheetId = "1blH9C1I4CSf2yJ_8AlM9a0U2wBFh7RSiDYO8-XfKxLQ";
        const range = "leads!A2:Z1000";

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
            auth: authClient
        });

        const rows = response.data.values || [];

        // Funciones de validación
        function isValidPhone(phone: string) {
            return /^3\d{9}$/.test(phone);
        }
        function isValidDate(date: string) {
            return /^(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})$/.test(date);
        }
        function isValidHour(hour: string) {
            return /^([01]?\d|2[0-3]):[0-5]\d$/.test(hour);
        }

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (row[18] && row[18].toLowerCase() === 'confirmado') {
                const phone = row[19] ? row[19].toString().trim() : '';
                const date = row[20] ? row[20].toString().trim() : '';
                const hour = row[21] ? row[21].toString().trim() : '';

                let reason = '';
                if (!isValidPhone(phone)) {
                    reason = `No se actualizó lead fila ${i + 2}: Teléfono inválido (${phone})`;
                } else if (!isValidDate(date)) {
                    reason = `No se actualizó lead fila ${i + 2}: Fecha inválida (${date})`;
                } else if (!isValidHour(hour)) {
                    reason = `No se actualizó lead fila ${i + 2}: Hora inválida (${hour})`;
                }

                if (reason) {
                    await sendAdminNotification('573023835142', reason);
                    continue;
                }

                // Cambiar a 'Por realizar'
                const updateRange = `leads!S${i + 2}`;
                await sheets.spreadsheets.values.update({
                    spreadsheetId,
                    range: updateRange,
                    valueInputOption: "RAW",
                    requestBody: { values: [["Por realizar"]] },
                    auth: authClient
                });
                return row[19] || null;
            }
        }
        return null;
    } catch (error) {
        console.error("❌ Error en updateFirstConfirmedLeadAndGetT:", error);
        return null;
    }
}
/**
 * Actualiza una celda específica en la fila del usuario identificado por su ID (cédula).
 * @param {string} id - ID o cédula del usuario
 * @param {number} colIndex - Índice de columna (0 = A, 1 = B, ...)
 * @param {string} value - Valor a escribir en la celda
 * @returns {Promise<{updated: boolean, error?: any}>}
 */
export async function updateUserCellById(id: string, colIndex: number, value: string): Promise<{ updated: boolean, error?: any }> {
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
                // Convertir índice de columna a letra (A=0, B=1, ...)
                const colLetter = String.fromCharCode(65 + colIndex);
                const updateRange = `usersDB!${colLetter}${i + 1}`;

                await sheets.spreadsheets.values.update({
                    spreadsheetId,
                    range: updateRange,
                    valueInputOption: "RAW",
                    requestBody: {
                        values: [[value]]
                    },
                    auth: authClient
                });

                return { updated: true };
            }
        }

        return { updated: false, error: "Usuario no encontrado" };
    } catch (error) {
        console.error("❌ Error actualizando celda de usuario:", error);
        return { updated: false, error };
    }
}
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
        //const promoCode = `PAWWI-${Math.floor(10000 + Math.random() * 90000)}`;

        // Orden correcto: Cel | CC | Name | Address | Pets | PromoCode
        const values = [[
            client.id,
            client.cc,
            client.name,
            client.address,
            dogsAsJson,
            //promoCode  // código promocional
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
            console.log(`✅ Cliente insertado en rango: ${updatedRange}`);
        }

        return { added: true };
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
        
        const dateInColombia = new Date().toLocaleString("es-CO", {
            timeZone: "America/Bogota",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }).replace(',', '');

        const values = [[
            dateInColombia,
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
            conv.precio,
            'Por confirmar',
            'Pendiente',
            'Pendiente',
            'Pendiente',
            'Pendiente',
            '-',
            '-',
            '-',
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

export async function applyPawwiloverDiscount(cedula: string) {
    try {
        const { sheets, authClient } = await getSheetClient();
        const spreadsheetId = "1blH9C1I4CSf2yJ_8AlM9a0U2wBFh7RSiDYO8-XfKxLQ";
        const range = "usersDB!A1:G1000";

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
            auth: authClient
        });

        const rows = response.data.values || [];

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const rowCedula = row[0];
            const discountFlag = row[6]; // Columna G

            if (rowCedula === cedula) {
                if (discountFlag && discountFlag.toLowerCase() === "pawwilover") {
                    console.log("Ya se ha aplicado ese descuento");
                    return { updated: false, message: "Ya se ha aplicado ese descuento" };
                }

                const updateRange = `usersDB!G${i + 1}`;
                await sheets.spreadsheets.values.update({
                    spreadsheetId,
                    range: updateRange,
                    valueInputOption: "RAW",
                    requestBody: {
                        values: [["pawwilover"]]
                    },
                    auth: authClient
                });

                console.log("✅ Descuento marcado como pawwilover");
                return { updated: true };
            }
        }

        console.log("❌ Usuario no encontrado");
        return { updated: false, message: "Usuario no encontrado" };
    } catch (error) {
        console.error("❌ Error al aplicar descuento:", error);
        return { updated: false, error };
    }
}

export async function getWalksCountForClient(id: string): Promise<number> {
    const { sheets, authClient } = await getSheetClient();
    const spreadsheetId = "1blH9C1I4CSf2yJ_8AlM9a0U2wBFh7RSiDYO8-XfKxLQ";

    const leadsRange = "leads!B2:B1000"; // Solo columna B (ID del cliente)
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: leadsRange,
        auth: authClient
    });

    const rows = response.data.values || [];

    let count = 0;
    for (const row of rows) {
        if (row[0] === id) {
            count++;
        }
    }

    return count;
}

export async function updateWalksCounterForClient(id: string): Promise<{
    updated: boolean;
    error?: any;
}> {
    try {
        const { sheets, authClient } = await getSheetClient();
        const spreadsheetId = "1blH9C1I4CSf2yJ_8AlM9a0U2wBFh7RSiDYO8-XfKxLQ";

        const usersRange = "usersDB!A2:H1000";
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: usersRange,
            auth: authClient
        });

        const rows = response.data.values || [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (row[0] === id) {
                const count = await getWalksCountForClient(id);
                const updateRange = `usersDB!H${i + 2}`; // +2 porque empieza en A2
                await sheets.spreadsheets.values.update({
                    spreadsheetId,
                    range: updateRange,
                    valueInputOption: "RAW",
                    requestBody: { values: [[count.toString()]] },
                    auth: authClient
                });
                return { updated: true };
            }
        }

        return { updated: false, error: "Cliente no encontrado en usersDB" };
    } catch (error) {
        console.error("❌ Error al actualizar contador individual:", error);
        return { updated: false, error };
    }
}
