// Pruebas del prototipo. Cada prueba verifica una decisión de la arquitectura o un requerimiento.
// Se ejecutan con "npm test" (usa el ejecutor de pruebas incluido en Node, sin librerías).

const test = require('node:test');
const assert = require('node:assert/strict');

const correos = require('../datos/correos.json');
const { crearSistema } = require('../src/sistema');
const { validarReserva } = require('../src/modelo');
const aerolinea = require('../src/adaptadores/adaptadorAerolinea');
const hotel = require('../src/adaptadores/adaptadorHotel');

const AHORA = '2026-10-28'; // fecha fija para que las pruebas no dependan del día en que se corran

// Crea un sistema con la fecha fija y procesa todos los mails de ejemplo
function sistemaConDatos() {
  const sistema = crearSistema({ ahora: () => AHORA });
  for (const mail of correos) sistema.ingesta.procesar(mail);
  return sistema;
}

test('ADR-0004: el adaptador de aerolíneas traduce al modelo común', () => {
  const reserva = aerolinea.traducir(correos[0]);
  validarReserva(reserva); // no lanza error: cumple el contrato
  assert.equal(reserva.tipo, 'vuelo');
  assert.equal(reserva.destino, 'Madrid');
  assert.equal(reserva.version, 1);
});

test('ADR-0004: el adaptador de hoteles traduce al mismo modelo común', () => {
  const reserva = hotel.traducir(correos[1]);
  validarReserva(reserva);
  assert.equal(reserva.tipo, 'hotel');
  assert.equal(reserva.proveedor, 'Hotel Gran Vía');
});

test('Contrato: una reserva sin destino es inválida', () => {
  const reserva = aerolinea.traducir(correos[0]);
  delete reserva.destino;
  assert.throws(() => validarReserva(reserva), /destino/);
});

test('RF-2: se ignora un mail de un remitente que no es seguro', () => {
  const sistema = crearSistema({ ahora: () => AHORA });
  const resultado = sistema.ingesta.procesar(correos[4]); // el mail de spam
  assert.equal(resultado.ignorado, 'remitente no seguro');
  assert.equal(sistema.viajes.viajes('vero', { incluirArchivados: true }).length, 0);
});

test('RF-1: un mail incompleto se rechaza y no genera reserva', () => {
  const sistema = crearSistema({ ahora: () => AHORA });
  const resultado = sistema.ingesta.procesar(correos[8]); // hotel sin fechas
  assert.ok(resultado.rechazado);
});

test('AD 2.4: un mail repetido se descarta y no duplica la reserva', () => {
  const sistema = sistemaConDatos();
  assert.equal(sistema.viajes.duplicadosDescartados, 1);
  const madrid = sistema.viajes.viajes('vero').find((v) => v.destino === 'Madrid');
  const vuelos = madrid.reservas.filter((r) => r.tipo === 'vuelo');
  assert.equal(vuelos.length, 1);
});

test('AD 2.4: una versión nueva reemplaza a la anterior', () => {
  const sistema = sistemaConDatos();
  const madrid = sistema.viajes.viajes('vero').find((v) => v.destino === 'Madrid');
  const vuelo = madrid.reservas.find((r) => r.tipo === 'vuelo');
  assert.equal(vuelo.version, 2);
  assert.equal(vuelo.fin, '2027-01-22'); // la fecha de regreso se actualizó
});

test('RF-5: las reservas se agrupan por viaje', () => {
  const sistema = sistemaConDatos();
  const viajes = sistema.viajes.viajes('vero');
  assert.equal(viajes.length, 2); // Madrid y Bariloche
  assert.deepEqual(viajes.map((v) => v.destino), ['Madrid', 'Bariloche']);
  assert.equal(viajes[0].reservas.length, 2); // vuelo y hotel en el mismo viaje
});

test('RF-5: el viaje completado se archiva y sale de la vista principal', () => {
  const sistema = sistemaConDatos();
  const activos = sistema.viajes.viajes('vero');
  assert.ok(activos.every((v) => v.estado === 'activo'));
  const todos = sistema.viajes.viajes('vero', { incluirArchivados: true });
  assert.equal(todos.length, 3);
  assert.equal(todos[0].destino, 'Córdoba');
  assert.equal(todos[0].estado, 'archivado');
});

test('ADR-0007: la caché se invalida cuando llega una reserva nueva', () => {
  const sistema = crearSistema({ ahora: () => AHORA });
  sistema.ingesta.procesar(correos[0]);
  assert.equal(sistema.viajes.viajes('vero').length, 1); // se llena la caché
  sistema.ingesta.procesar(correos[2]); // llega otro viaje
  assert.equal(sistema.viajes.viajes('vero').length, 2); // la caché no devuelve datos viejos
});

test('Contrato OpenAPI: GET /viajes responde 200 con los viajes y 400 sin usuario', async () => {
  const sistema = sistemaConDatos();
  await new Promise((listo) => sistema.gateway.listen(0, listo)); // puerto libre elegido por el sistema
  const { port } = sistema.gateway.address();
  try {
    const ok = await fetch(`http://localhost:${port}/viajes?usuario=vero`);
    assert.equal(ok.status, 200);
    assert.equal((await ok.json()).length, 2);
    const incompleta = await fetch(`http://localhost:${port}/viajes`);
    assert.equal(incompleta.status, 400);
  } finally {
    sistema.gateway.closeAllConnections();
    sistema.gateway.close();
  }
});
