// Arma el sistema conectando los elementos de la arquitectura.
// Es el único lugar donde se "cablea" todo, igual que en la vista de componentes de la Iteración 1.

const { Bus } = require('./bus');
const { ServicioIngesta } = require('./ingesta');
const { ServicioViajes } = require('./viajes');
const { crearGateway } = require('./gateway');
const { hoy } = require('./fechas');

// Whitelist de remitentes seguros (RF-2). En el prototipo es una lista fija.
const REMITENTES_SEGUROS = ['reservas@aerolineas-demo.com', 'reservas@hotel-demo.com'];

function crearSistema({ ahora = hoy, remitentesSeguros = REMITENTES_SEGUROS } = {}) {
  const bus = new Bus(); // 1) el bus de eventos
  const viajes = new ServicioViajes({ bus, ahora }); // 2) el servicio de viajes se suscribe al bus
  const ingesta = new ServicioIngesta({ bus, remitentesSeguros }); // 3) la ingesta publica en el bus
  const gateway = crearGateway(viajes); // 4) el gateway consulta al servicio de viajes
  return { bus, viajes, ingesta, gateway };
}

module.exports = { crearSistema, REMITENTES_SEGUROS };
