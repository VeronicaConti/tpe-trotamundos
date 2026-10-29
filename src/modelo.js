// Validador del contrato "Reserva" (contratos/modelo-reserva.schema.json).
// Spec-driven: el contrato se escribió primero y este código lo hace cumplir.
// Es un validador mínimo, sin librerías externas.

const esquema = require('../contratos/modelo-reserva.schema.json'); // carga el contrato

function validarReserva(reserva) {
  const errores = []; // acá se acumulan los problemas encontrados

  // 1) Todos los campos obligatorios deben estar presentes
  for (const campo of esquema.required) {
    const valor = reserva[campo];
    if (valor === undefined || valor === null || valor === '') {
      errores.push(`falta el campo obligatorio "${campo}"`);
    }
  }

  // 2) Cada campo presente debe cumplir la regla de su tipo
  for (const [campo, regla] of Object.entries(esquema.properties)) {
    const valor = reserva[campo];
    if (valor === undefined || valor === null || valor === '') continue; // ya informado arriba

    if (regla.type === 'string' && typeof valor !== 'string') {
      errores.push(`"${campo}" debe ser texto`);
    }
    if (regla.type === 'integer' && !Number.isInteger(valor)) {
      errores.push(`"${campo}" debe ser un entero`);
    }
    if (regla.minimum !== undefined && valor < regla.minimum) {
      errores.push(`"${campo}" debe ser como mínimo ${regla.minimum}`);
    }
    if (regla.enum && !regla.enum.includes(valor)) {
      errores.push(`"${campo}" debe ser uno de: ${regla.enum.join(', ')}`);
    }
    if (regla.format === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
      errores.push(`"${campo}" debe tener formato AAAA-MM-DD`);
    }
  }

  if (errores.length > 0) throw new Error(`Reserva inválida: ${errores.join('; ')}`);
  return reserva; // si todo está bien, devuelve la misma reserva
}

module.exports = { validarReserva };
