// Servicio de Viajes (RF-5). Elemento de la Iteración 1 (ADR-0001).
// Se suscribe a ReservaDetectada, descarta duplicados (AD 2.4), agrupa las reservas
// por viaje y mantiene una caché de itinerarios que se invalida con cada evento (ADR-0007).

const { sumarDias, hoy } = require('./fechas');

// Supuesto nuestro: dos reservas separadas por 1 día o menos pertenecen al mismo viaje
const MARGEN_DIAS = 1;

// Agrupa una lista de reservas en viajes
function agruparPorViaje(reservas) {
  const ordenadas = [...reservas].sort((a, b) => a.inicio.localeCompare(b.inicio)); // por fecha de inicio
  const viajes = [];
  for (const reserva of ordenadas) {
    const ultimo = viajes[viajes.length - 1]; // último viaje armado hasta ahora
    if (ultimo && reserva.inicio <= sumarDias(ultimo.fin, MARGEN_DIAS)) {
      // la reserva empieza dentro del viaje (o pegada al final): se suma a ese viaje
      ultimo.reservas.push(reserva);
      if (reserva.fin > ultimo.fin) ultimo.fin = reserva.fin; // el viaje se extiende si hace falta
    } else {
      // empieza después: es un viaje nuevo
      viajes.push({
        id: `viaje-${reserva.usuario}-${reserva.inicio}`,
        destino: reserva.destino,
        inicio: reserva.inicio,
        fin: reserva.fin,
        reservas: [reserva],
      });
    }
  }
  return viajes;
}

class ServicioViajes {
  constructor({ bus, ahora = hoy }) {
    this.ahora = ahora; // función que devuelve la fecha actual (se puede reemplazar en los tests)
    this.reservas = new Map(); // usuario -> (id de reserva -> reserva)
    this.cache = new Map(); // usuario -> viajes ya agrupados (ADR-0007)
    this.duplicadosDescartados = 0; // contador, útil para verificar AD 2.4
    bus.suscribir('ReservaDetectada', (reserva) => this.recibir(reserva)); // se suscribe al bus
  }

  // Maneja un evento ReservaDetectada. Devuelve true si la reserva se incorporó
  recibir(reserva) {
    if (!this.reservas.has(reserva.usuario)) this.reservas.set(reserva.usuario, new Map());
    const delUsuario = this.reservas.get(reserva.usuario);

    const actual = delUsuario.get(reserva.id);
    if (actual && actual.version >= reserva.version) {
      this.duplicadosDescartados += 1; // AD 2.4: misma versión o más vieja, se descarta
      return false;
    }

    delUsuario.set(reserva.id, reserva); // alta de la reserva o reemplazo por una versión nueva
    this.cache.delete(reserva.usuario); // ADR-0007: se invalida la caché del usuario
    return true;
  }

  // Devuelve los viajes de un usuario. Por defecto solo los activos (RF-5)
  viajes(usuario, { incluirArchivados = false } = {}) {
    let grupos = this.cache.get(usuario);
    if (!grupos) {
      // la caché no tiene al usuario: se calcula y se guarda
      const reservas = [...(this.reservas.get(usuario)?.values() ?? [])];
      grupos = agruparPorViaje(reservas);
      this.cache.set(usuario, grupos);
    }
    const fechaActual = this.ahora();
    // un viaje cuyo fin ya pasó queda archivado (RF-5)
    const conEstado = grupos.map((v) => ({ ...v, estado: v.fin < fechaActual ? 'archivado' : 'activo' }));
    return incluirArchivados ? conEstado : conEstado.filter((v) => v.estado === 'activo');
  }
}

module.exports = { ServicioViajes, agruparPorViaje };
