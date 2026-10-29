// Utilidad compartida por los adaptadores: lee líneas con formato "Clave: valor".

function leerCampos(cuerpo) {
  const campos = {};
  for (const linea of cuerpo.split('\n')) { // recorre el mail línea por línea
    const posicion = linea.indexOf(':'); // busca el primer ":" que separa clave y valor
    if (posicion === -1) continue; // la línea no tiene formato clave:valor, se ignora
    const clave = linea.slice(0, posicion).trim(); // texto antes de ":"
    const valor = linea.slice(posicion + 1).trim(); // texto después de ":"
    campos[clave] = valor;
  }
  return campos;
}

module.exports = { leerCampos };
