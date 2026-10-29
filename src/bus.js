// Bus de eventos. Elemento de la Iteración 1 (ADR-0001): patrón Publisher-Subscriber.
// Simplificación del prototipo: vive en memoria y entrega de forma sincrónica.
// En producción sería un broker en clúster (Iteración 3, AD 3.3).

class Bus {
  constructor() {
    // Mapa: nombre del evento -> lista de funciones suscriptas
    this.suscriptores = new Map();
  }

  // Un servicio se suscribe a un tipo de evento indicando qué función ejecutar
  suscribir(tipo, funcion) {
    if (!this.suscriptores.has(tipo)) this.suscriptores.set(tipo, []); // primera suscripción: crea la lista
    this.suscriptores.get(tipo).push(funcion); // agrega la función a la lista
  }

  // Un servicio publica un evento: se avisa a todos los suscriptos a ese tipo
  publicar(tipo, payload) {
    const funciones = this.suscriptores.get(tipo) ?? []; // si nadie se suscribió, lista vacía
    for (const funcion of funciones) funcion(payload); // entrega el evento a cada suscriptor
  }
}

module.exports = { Bus };
