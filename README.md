# TPE Trotamundos - Prototipo (Grupo 13)

TPE Diseño de Software: arquitectura de Trotamundos aplicando ADD.

La documentación completa (análisis inicial, 4 iteraciones de ADD, ADRs en formato MADR y vistas) está en la **Wiki** de este repositorio. Este repositorio contiene el **prototipo**, que demuestra la viabilidad de la arquitectura.

Integrantes: Verónica Conti y Nicolás Lapenta.

## Alcance del prototipo (CON-3)

| Requerimiento | Qué hace el prototipo |
|---|---|
| RF-1 Procesamiento de correo | Recibe mails, los traduce con un adaptador por proveedor y publica el evento `ReservaDetectada` |
| RF-2 Filtros y whitelists | Ignora los mails de remitentes que no están en la lista segura |
| RF-5 Ciclo de vida del viaje | Agrupa las reservas por viaje y archiva automáticamente los viajes completados |

## Trazabilidad: arquitectura, código y decisiones

| Elemento de la arquitectura | Módulo del prototipo | Decisiones |
|---|---|---|
| Bus de eventos | `src/bus.js` | ADR-0001 (patrón Publisher-Subscriber) |
| Servicio de Ingesta de Correo | `src/ingesta.js` | ADR-0001, ADR-0002 (solo el flujo de ingesta) |
| Adaptadores de proveedores | `src/adaptadores/` | ADR-0004 (patrón Adapter) |
| Modelo común de reserva | `contratos/modelo-reserva.schema.json` y `src/modelo.js` | ADR-0004 |
| Servicio de Viajes | `src/viajes.js` | ADR-0001, AD 2.4 (deduplicación) |
| Caché de itinerarios | `src/viajes.js` (`this.cache`) | ADR-0007 |
| API Gateway | `src/gateway.js` y `contratos/openapi.yaml` | Iteración 1 |
| Composición del sistema | `src/sistema.js` | Vista de componentes de la Iteración 1 |

## Spec-driven

Los contratos están en `contratos/` y se definieron antes que el código:

* `modelo-reserva.schema.json`: modelo común de reserva. Los adaptadores traducen a este formato y `src/modelo.js` lo hace cumplir.
* `openapi.yaml`: contrato de la API (`GET /viajes`). El gateway y las pruebas lo respetan.

Las pruebas de `test/prototipo.test.js` verifican las decisiones: modelo común (ADR-0004), whitelist (RF-2), deduplicación y versiones (AD 2.4), agrupación y archivado (RF-5), invalidación de la caché (ADR-0007) y el contrato de la API.

## Cómo ejecutarlo

Requiere Node.js 18 o superior. No tiene dependencias que instalar.

```
npm run demo        # procesa los mails de ejemplo y muestra los viajes
npm test            # ejecuta las pruebas
npm run servidor    # levanta la API en http://localhost:3000/viajes?usuario=vero
```

## Qué no incluye el prototipo

Queda fuera, por decisión de alcance, y se resuelve en la arquitectura documentada: webhooks y polling reales (ADR-0002), trabajadores y cola priorizada (ADR-0003), despliegue multi-región y replicación (ADR-0005 y ADR-0006), acceso real a los mails con OAuth (ADR-0008), almacén analítico (ADR-0009) y el módulo avanzado de la segunda entrega.

El bus de eventos del prototipo vive en memoria y entrega de forma sincrónica; en la arquitectura es un broker en clúster.
