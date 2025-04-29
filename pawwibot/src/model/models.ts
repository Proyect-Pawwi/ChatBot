export class conversation {
    lastInteraction: number = Date.now();
    
    id: string = '';
    cc: number = 0;
    name: string = '';
    dogs: {
        nombre: string;
        raza: string;
        edad: string;
        peso: string;
        descripcion: string;
    }[] = [];

    selectedDog?: {
        nombre: string;
        raza: string;
        edad: string;
        peso: string;
        descripcion: string;
    };

    address: string = '';
    tipoServicio: string = '';
    fechaServicio: string = '';
    inicioServicio: string = '';
    tiempoServicio: string = '';
    ciudad: string = '';
    localidad: string = '';
    barrio: string = '';

    precio: number = 0;

    constructor() {
      this.lastInteraction = Date.now();
    }
}
