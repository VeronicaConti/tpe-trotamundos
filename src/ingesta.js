// Servicio de Ingesta de Correo (RF-1 y RF-2). Elemento de la Iteración 1 (ADR-0001).
// Recibe un mail, lo filtra, lo traduce con el adaptador correcto y publica el evento ReservaDetectada.

const adaptadores = require('./adaptadores');
const { validarReserva } = require('./modelo');

class ServicioIngesta {
  constructor({ bus, remitentesSeguros }) {
    this.bus = bus; // por donde se publican los eventos
    this.remitentesSeguros = new Set(remitentesSeguros); // whitelist de remitentes (RF-2)
  }

  // Procesa un mail y devuelve qué pasó con él
  procesar(mail) {
    // RF-2: se ignoran los mails de remitentes que no están en la lista segura
    if (!this.remitentesSeguros.has(mail.remitente)) {
      return { ignorado: 'remitente no seguro' };
    }

    // Se busca el adaptador que sabe leer este mail
    const adaptador = adaptadores.find((a) => a.puedeTraducir(mail));
    if (!adaptador) return { ignorado: 'sin adaptador para este mail' };

    try {
      const reserva = validarReserva(adaptador.traducir(mail)); // traduce y valida contra el contrato
      this.bus.publicar('ReservaDetectada', reserva); // RF-1: publica el evento en el bus
      return { publicado: reserva.id, version: reserva.version };
    } catch (error) {
      return { rechazado: error.message }; // el mail no cumple el contrato (ej. faltan fechas)
    }
  }
}

module.exports = { ServicioIngesta };
