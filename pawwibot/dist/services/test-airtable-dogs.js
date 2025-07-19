import { createDog, getDogs, updateDog, deleteDog } from "./airtable-dogs";
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
    const createRes = await createDog(dog);
    console.log("Create response:", createRes);
    const recordId = createRes.records[0].id;
    console.log("Getting all dogs...");
    const allDogs = await getDogs();
    console.log("All dogs:", allDogs.records.map(r => ({ id: r.id, ...r.fields })));
    console.log("Updating dog...");
    const updateRes = await updateDog(recordId, { Nombre: "TestDogUpdated" });
    console.log("Update response:", updateRes);
    console.log("Deleting dog...");
    const deleteRes = await deleteDog(recordId);
    console.log("Delete response:", deleteRes);
}
testCRUD().catch(console.error);
//# sourceMappingURL=test-airtable-dogs.js.map