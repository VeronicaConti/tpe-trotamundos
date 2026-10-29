// Adaptador de hoteles (patrón Adapter, ADR-0004).
// Misma interfaz que el adaptador de aerolíneas: el resto del sistema no sabe
// qué proveedor está leyendo, solo recibe una Reserva en el modelo común.

const { leerCampos } = require('./comun');

module.exports = {
  nombre: 'hotel',

  puedeTraducir: (mail) => /hotel/i.test(mail.asunto),

  traducir(mail) {
    const c = leerCampos(mail.cuerpo);
    return {
      id: `hotel-${c['Número de reserva']}`,
      version: Number(c['Versión'] ?? 1),
      usuario: mail.usuario,
      tipo: 'hotel',
      proveedor: c['Hotel'],
      inicio: c['Check-in'],
      fin: c['Check-out'],
      destino: c['Ciudad'],
    };
  },
};
