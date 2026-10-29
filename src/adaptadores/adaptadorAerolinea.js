// Adaptador de aerolíneas (patrón Adapter, ADR-0004).
// Traduce el mail de una aerolínea al modelo común de reserva.
// Todo adaptador cumple la misma interfaz: { nombre, puedeTraducir(mail), traducir(mail) }.

const { leerCampos } = require('./comun');

module.exports = {
  nombre: 'aerolinea',

  // Decide si este adaptador sabe leer el mail (por el asunto)
  puedeTraducir: (mail) => /vuelo/i.test(mail.asunto),

  // Convierte el mail al modelo común
  traducir(mail) {
    const c = leerCampos(mail.cuerpo);
    return {
      id: `vuelo-${c['Código de reserva']}`, // identificador estable de la reserva
      version: Number(c['Versión'] ?? 1), // si el mail no indica versión, es la 1
      usuario: mail.usuario,
      tipo: 'vuelo',
      proveedor: 'Aerolíneas Demo',
      inicio: c['Fecha de salida'],
      fin: c['Fecha de regreso'],
      destino: c['Destino'],
    };
  },
};
