# QR Studio — Verificación del MVP

Fecha: 12 de octubre de 2026.

## Verificación automatizada

Realizada con Chrome de escritorio automatizado en Windows, abriendo el HTML local, y con un decodificador independiente (`jsQR`).

| Comprobación | Resultado |
| --- | --- |
| Los 11 campos y nombre o apellido obligatorio | Aprobado |
| Email, teléfonos, protocolos URL y dominio LinkedIn | Aprobado |
| Escapes de coma, punto y coma y barra invertida | Aprobado |
| CRLF y plegado a 75 octetos sin cortar UTF-8 | Aprobado |
| Dos propiedades URL y respaldo de LinkedIn en NOTE | Aprobado |
| Provincia y país en sus componentes ADR correspondientes | Aprobado |
| PNG decodificado y comparado byte a byte con VCF | Aprobado |
| SVG rasterizado en navegador, decodificado y comparado con VCF | Aprobado |
| QR con acentos, caracteres chinos y emoji | Aprobado en decodificador de prueba |
| Nombres de descarga y eventos para PNG, SVG y VCF | Aprobado |
| Bloqueo de descargas y ocultamiento al cambiar datos | Aprobado |
| Limpieza de formulario y errores | Aprobado |
| Contacto extenso y advertencia de densidad | Aprobado |
| Recuperación después de exceder la capacidad QR | Aprobado |
| Sin desbordes a 320, 390, 768 y 1440 píxeles | Aprobado |
| Sin errores JavaScript ni peticiones externas al usar la app | Aprobado |
| Sin datos en localStorage o sessionStorage | Aprobado |
| Generación desde HTML local sin conexión | Aprobado |

Se revisaron visualmente las capturas de escritorio y pantalla móvil. Las pruebas de ancho se realizan con Chrome; no equivalen a pruebas de Safari, Android o iOS.

### Límite del entorno automatizado

El entorno de ejecución bloqueó la conexión al servidor local y canceló la escritura de descargas del navegador. Se probaron la aplicación desde `file://`, los eventos de descarga, los nombres y los **Blobs exactos** entregados a los enlaces. Esos bytes se guardaron desde la herramienta de pruebas para decodificarlos y comparar su contenido. **Queda pendiente confirmar el guardado mediante los tres botones en un navegador normal del usuario.**

## Prueba manual de escritorio

1. Abrir `index.html` junto a `style.css`, `app.js` y `vendor`.
2. Elegir **Cargar ejemplo → Generar QR**.
3. Descargar PNG, SVG y VCF con los tres botones. Confirmar que cada archivo se guarda y abre.
4. Importar el VCF. Verificar los 11 campos y ambos enlaces.
5. Cambiar un dato. Confirmar que las descargas se bloquean hasta generar nuevamente.
6. Probar email inválido, URL inválida y formulario sin nombre ni apellido.
7. Desconectar Internet y repetir la generación y descarga.

## Matriz de teléfonos reales — pendiente

Completar una fila por combinación de teléfono, sistema, lector y aplicación de contactos. No usar contactos reales de terceros para las pruebas.

| Teléfono / sistema | Lector QR / app de contactos | QR desde pantalla | QR impreso | Importación VCF | Dos URL / LinkedIn en notas | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| iPhone / versión a registrar | Cámara / Contactos u otra app | Pendiente | Pendiente | Pendiente | Pendiente | Sin probar |
| Android / modelo y versión a registrar | Cámara o lector elegido / app de contactos | Pendiente | Pendiente | Pendiente | Pendiente | Sin probar |

Para cada combinación:

1. Escanear el QR del ejemplo desde una pantalla diferente y guardar el contacto.
2. Verificar nombre, apellido, empresa, cargo, celular, teléfono laboral, email, sitio web, LinkedIn, país y provincia. En ADR comprobar provincia y país, sin confundirlos con ciudad o código postal.
3. Revisar ambos enlaces y la nota de LinkedIn. Registrar si el lector pierde una URL o solo muestra texto.
4. Repetir con nombres acentuados y caracteres no latinos; registrar cualquier pérdida o sustitución.
5. Abrir e importar el VCF y comparar con el contacto obtenido al escanear.
6. Imprimir el SVG al tamaño orientativo sugerido y probar lectura a distancia normal, con iluminación habitual. Repetir con un contacto de mayor densidad.
7. Escanear sin conexión. Guardar el contacto no debería requerir Internet si el lector admite vCard; abrir una web sí puede requerirlo.

La compatibilidad se confirma para las combinaciones que aprueben estas pruebas. Si un lector muestra solo texto o pierde campos, registrar el caso antes de modificar el formato.
