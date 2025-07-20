"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const airtable_dogs_1 = require("./airtable-dogs");
async function testCRUD() {
    const dog = {
        Celular: "573000000000",
        Nombre: "TestDog",
        Raza: "TestRaza",
        Edad: "2",
        Consideraciones: "Ninguna",
        Vacunas: "true"
    };
    console.log("Creating dog...");
    const createRes = await (0, airtable_dogs_1.createDog)(dog);
    console.log("Create response:", createRes);
    const recordId = createRes.records[0].id;
    console.log("Getting all dogs...");
    const allDogs = await (0, airtable_dogs_1.getDogs)();
    console.log("All dogs:", allDogs.records.map(r => ({ id: r.id, ...r.fields })));
    console.log("Updating dog...");
    const updateRes = await (0, airtable_dogs_1.updateDog)(recordId, { Nombre: "TestDogUpdated" });
    console.log("Update response:", updateRes);
    console.log("Deleting dog...");
    const deleteRes = await (0, airtable_dogs_1.deleteDog)(recordId);
    console.log("Delete response:", deleteRes);
}
testCRUD().catch(console.error);
//# sourceMappingURL=test-airtable-dogs.js.map