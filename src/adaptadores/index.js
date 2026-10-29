// Registro de adaptadores disponibles.
// Para sumar un medio de transporte nuevo (QA-8) alcanza con crear su adaptador
// (por ejemplo adaptadorTren.js) y agregarlo a esta lista, sin tocar ningún otro módulo.

module.exports = [
  require('./adaptadorAerolinea'),
  require('./adaptadorHotel'),
];
