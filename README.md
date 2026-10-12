# QR Studio

Generador gratuito de códigos QR estáticos para contactos vCard 3.0. HTML, CSS y JavaScript, sin backend, cuentas ni base de datos. Los datos se procesan en el navegador y no se guardan en la aplicación.

## Usar localmente

Abrí `index.html` en un navegador moderno. Conservá `style.css`, `app.js` y la carpeta `vendor` en la misma carpeta. No necesitás instalar herramientas ni tener conexión a Internet para generar el QR. También se puede servir como cualquier sitio estático.

1. Completá al menos nombre o apellido; los otros campos son opcionales.
2. Presioná **Generar QR**.
3. Escaneá la vista previa o descargá **PNG**, **SVG** o **VCF**.
4. Si editás un campo, generá nuevamente el QR. Las descargas quedan bloqueadas hasta actualizarlo.

El botón **Cargar ejemplo** usa datos ficticios para probar la aplicación.

## Primera versión

- 11 campos: nombre, apellido, empresa, cargo, celular, teléfono laboral, email, página web, LinkedIn, país y provincia.
- PNG de al menos 1024 píxeles y SVG vectorial, con cuatro módulos de margen blanco.
- Corrección de errores M y contenido en modo byte UTF-8.
- Descarga VCF con finales de línea CRLF, escape de valores de texto y plegado de líneas a 75 octetos sin dividir caracteres UTF-8.
- Validación de nombre/apellido, longitud, email, teléfonos, enlaces HTTP/HTTPS y dominio de LinkedIn. No se verifica que un número, email o perfil exista.
- Indicador de densidad según la versión QR: moderada (1–10), elevada (11–20), muy elevada (21–40). Son umbrales orientativos, no una medición de capacidad de escaneo.
- Diseño responsive, etiquetas de formulario, resumen de errores, foco visible y estado anunciado a lectores de pantalla.

## Dos enlaces y compatibilidad

Página web y LinkedIn se incluyen como propiedades `URL` independientes. LinkedIn se repite en `NOTE` como respaldo si el importador muestra una sola URL. Esta repetición aumenta la densidad. Algunos lectores pueden mostrar solo texto o no conservar ambas URL; depende del lector y la aplicación de contactos.

La compatibilidad física con Android y iPhone **está pendiente de comprobación**. Simular una pantalla móvil en un navegador no verifica el escaneo ni la importación de contactos. Usá la matriz de `PRUEBAS.md` y registrá dispositivo, versión y lector antes de declarar compatibilidad.

## Legibilidad y privacidad

El QR contiene directamente los datos; no vence por un servicio externo. Para actualizar el contacto hay que generar otro QR y reemplazar las copias anteriores. Quien reciba el QR podrá leer la información incluida.

La sugerencia de impresión usa 0,4 mm por módulo, incluyendo el borde blanco, con un mínimo orientativo de 30 mm. Probá siempre la impresión real, su contraste, iluminación y distancia. Acortá los enlaces largos y evitá reducir o recortar el borde blanco. SVG es la opción recomendada para impresión.

La aplicación no hace peticiones a servicios de QR, no usa analítica, cookies ni almacenamiento de contactos. Al alojarla, el proveedor recibe las peticiones normales de carga del sitio. Los datos introducidos no se envían con esas peticiones. El enlace al repositorio abre GitHub solo si lo seleccionás.

## Archivos

```text
index.html               Formulario, vista previa y descargas
style.css                Diseño y adaptación a pantallas
app.js                   Validación, vCard, QR y descargas
vendor/qrcode.min.js      Librería QR local precompilada
vendor/LICENSE-*.txt      Licencias de terceros
README.md                Uso y decisiones técnicas
PRUEBAS.md               Pruebas y compatibilidad pendiente
LICENSE                  Licencia MIT del proyecto
```

`app.js` separa validación, serialización y presentación. El registro `QRStudio.formats` permite incorporar tipos futuros sin cambiar el motor de QR ni las descargas. No hay framework ni proceso de compilación para usar o publicar la aplicación.

## Dependencia incluida

[node-qrcode](https://github.com/soldair/node-qrcode), versión **1.5.4**, licencia MIT. El bundle para navegador incluye dijkstrajs **1.0.3**, MIT. Sus avisos se conservan en `vendor`. No se requiere npm para usar el sitio.

Para regenerar el bundle, en un entorno de desarrollo separado instalá `qrcode@1.5.4` y `esbuild@0.25.12`, y ejecutá:

```sh
npx esbuild node_modules/qrcode/lib/browser.js --bundle --minify --format=iife --global-name=QRCode --legal-comments=inline --outfile=vendor/qrcode.min.js
```

Conservá también las licencias de ambas dependencias. Referencia del formato: [RFC 2426](https://www.rfc-editor.org/rfc/rfc2426) y [RFC 2425](https://www.rfc-editor.org/rfc/rfc2425).

## Incorporar al repositorio existente

Repositorio: [ferhb03/qr-studio](https://github.com/ferhb03/qr-studio). No crear otro repositorio.

En su página principal, elegí **Add file → Upload files**. Arrastrá `index.html`, `style.css`, `app.js`, `README.md`, `PRUEBAS.md` y la carpeta **vendor completa** a la raíz. Los archivos existentes se actualizarán. No subas el ZIP como un archivo, ni la carpeta `.git`. La licencia MIT existente se conserva.

Revisá que `vendor/qrcode.min.js` tenga esa ruta y no quede dentro de una carpeta adicional `qr-studio/`. Guardá los cambios con el mensaje `Implementar MVP vCard de QR Studio`. Se puede proponer una rama nueva y revisar sus cambios antes de incorporarla a `main`.

Guía oficial: [subir archivos a GitHub](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository).

## GitHub Pages: etapa posterior

Primero probar e incorporar los archivos. Esta entrega no activa Pages.

Cuando las pruebas estén aprobadas: **Settings → Pages → Build and deployment → Source: Deploy from a branch → main → /(root) → Save**. La URL prevista es `https://ferhb03.github.io/qr-studio/`; no se considera publicada hasta que GitHub confirme el despliegue. Todos los recursos usan rutas relativas para funcionar bajo `/qr-studio/`.

[Guía oficial de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Evolución

Agregar progresivamente enlaces, texto, email, llamadas y SMS; luego WhatsApp, Wi-Fi, eventos y ubicaciones. Los QR para PDF necesitan una URL donde esté alojado el archivo. Personalización y generación masiva se incorporarán después de validar lectura y compatibilidad, sin cargar complejidad en este MVP.
