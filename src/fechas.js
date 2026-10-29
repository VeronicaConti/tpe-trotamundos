// Utilidades de fechas. Las fechas se manejan como texto "AAAA-MM-DD",
// que se puede comparar directamente con < y > porque el orden alfabético coincide con el cronológico.

// Suma (o resta) días a una fecha y devuelve otra fecha en el mismo formato
function sumarDias(fecha, dias) {
  const d = new Date(`${fecha}T00:00:00Z`); // interpreta la fecha en UTC para evitar corrimientos
  d.setUTCDate(d.getUTCDate() + dias); // suma los días
  return d.toISOString().slice(0, 10); // devuelve solo "AAAA-MM-DD"
}

// Fecha de hoy en formato "AAAA-MM-DD"
function hoy() {
  return new Date().toISOString().slice(0, 10);
}

module.exports = { sumarDias, hoy };
