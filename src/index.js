// Demo del prototipo: procesa los mails de ejemplo y muestra los viajes resultantes.
// Uso: "npm run demo". Con "npm run servidor" además levanta la API en el puerto 3000.

const correos = require('../datos/correos.json');
const { crearSistema } = require('./sistema');

const sistema = crearSistema();

console.log('=== Ingesta de correos (RF-1 y RF-2) ===');
for (const mail of correos) {
  const resultado = sistema.ingesta.procesar(mail); // qué pasó con cada mail
  console.log(`- ${mail.asunto} <${mail.remitente}> -> ${JSON.stringify(resultado)}`);
}
console.log(`Duplicados descartados: ${sistema.viajes.duplicadosDescartados}`);

console.log('\n=== Viajes de "vero" agrupados (RF-5) ===');
for (const viaje of sistema.viajes.viajes('vero', { incluirArchivados: true })) {
  console.log(`${viaje.estado.toUpperCase()}  ${viaje.destino}  ${viaje.inicio} -> ${viaje.fin}`);
  for (const r of viaje.reservas) {
    console.log(`    · ${r.tipo} (${r.proveedor})  ${r.inicio} -> ${r.fin}  [versión ${r.version}]`);
  }
}

// Con --servidor se expone la API definida en contratos/openapi.yaml
if (process.argv.includes('--servidor')) {
  sistema.gateway.listen(3000, () => {
    console.log('\nAPI lista: http://localhost:3000/viajes?usuario=vero');
  });
}
