import { createDog, getDogs, updateDog, deleteDog } from "./airtable-dogs";

async function testCRUD() {
  // 1. CREATE
  const dog = {
    Celular: "573000000000",
    Nombre: "TestDog",
    Raza: "TestRaza",
    Edad: "2",
    Consideraciones: "Ninguna",
    // Changed Vacunas to a string to match the expected 'string' type
    Vacunas: "true" // Or "false", "Sí", "No", etc., depending on your string representation
  };
  console.log("Creating dog...");
  const createRes = await createDog(dog);
  console.log("Create response:", createRes);
  // @ts-ignore
  const recordId = createRes.records[0].id;

  // 2. READ
  console.log("Getting all dogs...");
  const allDogs = await getDogs();
  // @ts-ignore
  console.log("All dogs:", allDogs.records.map(r => ({ id: r.id, ...r.fields })));

  // 3. UPDATE
  console.log("Updating dog...");
  const updateRes = await updateDog(recordId, { Nombre: "TestDogUpdated" });
  console.log("Update response:", updateRes);

  // 4. DELETE
  console.log("Deleting dog...");
  const deleteRes = await deleteDog(recordId);
  console.log("Delete response:", deleteRes);
}

testCRUD().catch(console.error);