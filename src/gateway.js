// API Gateway. Elemento de la Iteración 1 (ADR-0001): punto de entrada único.
// Implementa el contrato contratos/openapi.yaml (GET /viajes). Usa solo el módulo http de Node.

const http = require('node:http');

function crearGateway(servicioViajes) {
  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost'); // separa ruta y parámetros

    // Función auxiliar para responder siempre en JSON
    const responder = (codigo, cuerpo) => {
      res.writeHead(codigo, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(cuerpo));
    };

    // El contrato solo define GET /viajes
    if (req.method !== 'GET' || url.pathname !== '/viajes') {
      return responder(404, { error: 'no encontrado' });
    }

    const usuario = url.searchParams.get('usuario');
    if (!usuario) return responder(400, { error: 'falta el parámetro usuario' }); // 400 según el contrato

    const incluirArchivados = url.searchParams.get('archivados') === 'true';
    return responder(200, servicioViajes.viajes(usuario, { incluirArchivados })); // 200 con la lista de viajes
  });
}

module.exports = { crearGateway };
