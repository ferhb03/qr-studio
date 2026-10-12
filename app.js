
/* QR Studio — lógica de contacto y presentación, sin servicios externos. */
(function (root) {
  'use strict';
  const fields = ['firstName', 'lastName', 'company', 'title', 'mobile', 'workPhone', 'email', 'website', 'linkedin', 'country', 'region'];
  const limits = [100, 100, 150, 150, 40, 40, 254, 500, 500, 100, 100];
  const labels = ['Nombre', 'Apellido', 'Empresa', 'Cargo / Puesto', 'Celular', 'Teléfono laboral', 'Email', 'Página web', 'LinkedIn', 'País', 'Provincia'];
  const encoder = new TextEncoder();
  function escapeText(value) {
    return value.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
  }
  // RFC 2425: líneas de hasta 75 octetos; no dividir un carácter UTF-8.
  function foldLine(line) {
    let output = '', part = '', bytes = 0;
    for (const char of line) {
      const length = encoder.encode(char).length;
      if (bytes + length > 75) { output += part + '\r\n'; part = ' '; bytes = 1; }
      part += char;
      bytes += length;
    }
    return output + part;
  }
  function normalizeUrl(value) {
    if (/\s/.test(value)) throw new Error('No se permiten espacios en los enlaces.');
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(value) ? value : 'https://' + value);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.') || url.username || url.password) throw new Error('Usá un enlace web completo, sin credenciales.');
    return url.href;
  }
  function validate(raw) {
    const data = {}, errors = [];
    fields.forEach((field, i) => {
      data[field] = String(raw[field] || '').trim();
      if (data[field].length > limits[i]) errors.push({ field, message: labels[i] + ': máximo ' + limits[i] + ' caracteres.' });
      if (/[\x00-\x1f\x7f]/.test(data[field])) errors.push({ field, message: labels[i] + ': quitá saltos de línea o caracteres de control.' });
    });
    if (!data.firstName && !data.lastName) errors.push({ field: 'firstName', message: 'Completá al menos nombre o apellido.' });
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push({ field: 'email', message: 'Ingresá un email válido, por ejemplo nombre@empresa.com.' });
    ['mobile', 'workPhone'].forEach(field => {
      if (data[field] && (!/^\+?[\d ().-]+$/.test(data[field]) || data[field].replace(/\D/g, '').length < 5 || data[field].replace(/\D/g, '').length > 15)) errors.push({ field, message: (field === 'mobile' ? 'Celular' : 'Teléfono laboral') + ': ingresá entre 5 y 15 dígitos; podés usar +, espacios, guiones y paréntesis.' });
    });
    ['website', 'linkedin'].forEach(field => {
      if (!data[field]) return;
      try {
        data[field] = normalizeUrl(data[field]);
        const hostname = new URL(data[field]).hostname.toLowerCase();
        if (field === 'linkedin' && hostname !== 'linkedin.com' && !hostname.endsWith('.linkedin.com')) throw new Error('El enlace debe pertenecer a linkedin.com.');
      } catch (error) { errors.push({ field, message: (field === 'website' ? 'Página web' : 'LinkedIn') + ': ' + (error.message.startsWith('El enlace') ? error.message : 'ingresá una URL http o https válida, sin espacios ni credenciales.') }); }
    });
    return { data, errors };
  }
  function buildVCard(data) {
    const text = escapeText;
    const lines = ['BEGIN:VCARD', 'VERSION:3.0', 'N:' + [data.lastName, data.firstName, '', '', ''].map(text).join(';'), 'FN:' + text([data.firstName, data.lastName].filter(Boolean).join(' '))];
    if (data.company) lines.push('ORG:' + text(data.company));
    if (data.title) lines.push('TITLE:' + text(data.title));
    if (data.mobile) lines.push('TEL;TYPE=CELL:' + data.mobile.replace(/[ ().-]/g, ''));
    if (data.workPhone) lines.push('TEL;TYPE=WORK,VOICE:' + data.workPhone.replace(/[ ().-]/g, ''));
    if (data.email) lines.push('EMAIL;TYPE=INTERNET:' + text(data.email));
    // URL es un URI, no un valor TEXT: conservar sus separadores.
    if (data.website) lines.push('URL:' + data.website);
    if (data.linkedin) {
      lines.push('URL:' + data.linkedin);
      lines.push('NOTE:' + text('LinkedIn: ' + data.linkedin));
    }
    if (data.region || data.country) lines.push('ADR;TYPE=WORK:;;;;' + text(data.region) + ';;' + text(data.country));
    lines.push('END:VCARD');
    return lines.map(foldLine).join('\r\n') + '\r\n';
  }
  // Cada nuevo tipo puede agregar su validación y serialización aquí.
  const formats = { vcard: { validate, serialize: buildVCard } };
  const api = { fields, validate, buildVCard, foldLine, escapeText, formats };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.QRStudio = api;
  if (typeof document === 'undefined') return;

  const $ = id => document.getElementById(id);
  const form = $('contact-form'), canvas = $('qr-canvas');
  const buttons = ['png', 'svg', 'vcf'].map(format => $('download-' + format));
  let result = null, revision = 0;
  function setStatus(message, warning = false) { $('status').textContent = message; $('status').classList.toggle('warning', warning); }
  function clearErrors() {
    $('form-errors').hidden = true;
    $('form-errors').replaceChildren();
    fields.forEach(field => { $(field).removeAttribute('aria-invalid'); $(field).removeAttribute('aria-errormessage'); });
  }
  function invalidate(message) {
    revision++;
    result = null;
    buttons.forEach(button => { button.disabled = true; });
    canvas.hidden = true;
    $('empty-state').hidden = false;
    $('density').hidden = true;
    $('contact-name').textContent = 'Tu tarjeta de contacto';
    $('contact-description').textContent = 'vCard 3.0 · Lista para guardar';
    $('vcard-content').textContent = 'Generá un contacto para ver sus datos.';
    setStatus(message);
  }
  form.addEventListener('input', () => { clearErrors(); invalidate('Datos modificados. Generá el QR para actualizarlo.'); });
  form.addEventListener('reset', () => { clearErrors(); invalidate('Formulario limpio. Creá un nuevo contacto.'); $('vcard-details').open = false; });
  $('example').addEventListener('click', () => {
    const example = { firstName: 'Ana', lastName: 'García', company: 'Estudio Norte', title: 'Diseñadora', mobile: '+54 9 11 1234 5678', workPhone: '+54 11 4567 8901', email: 'ana@example.com', website: 'https://example.com', linkedin: 'https://www.linkedin.com/in/ejemplo', country: 'Argentina', region: 'Buenos Aires' };
    fields.forEach(field => { $(field).value = example[field]; });
    clearErrors(); invalidate('Ejemplo ficticio cargado. Presioná Generar QR.');
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    clearErrors();
    invalidate('Generando tu QR…');
    const token = revision;
    const { data, errors } = formats.vcard.validate(Object.fromEntries(new FormData(form)));
    if (errors.length) {
      const list = document.createElement('ul');
      errors.forEach(error => {
        const item = document.createElement('li'); item.textContent = error.message; list.append(item);
        $(error.field).setAttribute('aria-invalid', 'true');
        $(error.field).setAttribute('aria-errormessage', 'form-errors');
      });
      $('form-errors').append(list); $('form-errors').hidden = false;
      setStatus('Revisá los campos indicados.', true); $(errors[0].field).focus(); return;
    }
    try {
      if (!root.QRCode) throw new Error('LIBRARY_MISSING');
      const vcard = formats.vcard.serialize(data);
      const segments = [{ data: vcard, mode: 'byte' }];
      const qr = root.QRCode.create(segments, { errorCorrectionLevel: 'M' });
      const modules = qr.modules.size;
      const options = { errorCorrectionLevel: 'M', margin: 4, scale: Math.ceil(1024 / (modules + 8)), color: { dark: '#000000ff', light: '#ffffffff' } };
      // Renderizar aparte para que una operación anterior no reemplace la vista actual.
      const generated = document.createElement('canvas');
      await root.QRCode.toCanvas(generated, segments, options);
      const svg = await root.QRCode.toString(segments, { ...options, type: 'svg' });
      if (token !== revision) return;
      canvas.width = generated.width; canvas.height = generated.height;
      canvas.getContext('2d').drawImage(generated, 0, 0);
      result = { vcard, svg, data };
      canvas.hidden = false; $('empty-state').hidden = true;
      $('contact-name').textContent = [data.firstName, data.lastName].filter(Boolean).join(' ');
      $('contact-description').textContent = [data.title, data.company].filter(Boolean).join(' · ') || 'Contacto vCard 3.0';
      $('vcard-content').textContent = vcard;
      $('density').hidden = false; $('density-meter').value = qr.version;
      const level = qr.version <= 10 ? 'moderada' : qr.version <= 20 ? 'elevada' : 'muy elevada';
      $('density-label').textContent = 'Densidad ' + level;
      $('density-metrics').textContent = encoder.encode(vcard).length + ' bytes · ' + modules + ' × ' + modules;
      const size = Math.max(30, Math.ceil((modules + 8) * .4));
      $('density-advice').textContent = 'Versión QR ' + qr.version + '/40 · Corrección M. Como punto de partida para impresión: ' + size + ' mm de lado, incluido el borde blanco. ' + (qr.version > 10 ? 'Reducí datos o aumentá el tamaño; evitá enlaces largos. ' : '') + 'Esta orientación no garantiza lectura: probá el tamaño final.';
      buttons.forEach(button => { button.disabled = false; });
      setStatus('QR actualizado. Podés descargarlo o escanearlo.');
    } catch (error) {
      if (token !== revision) return;
      setStatus(error.message === 'LIBRARY_MISSING' ? 'No se cargó la librería QR. Verificá que la carpeta vendor esté junto a los tres archivos.' : 'No pudimos generar el QR. Reducí la longitud de los campos o enlaces y volvé a intentar.', true);
    }
  });
  function download(blob, extension) {
    const name = [result.data.firstName, result.data.lastName].filter(Boolean).join('-').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-').slice(0, 80) || 'contacto';
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = 'qr-studio-' + name + '.' + extension;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  $('download-svg').addEventListener('click', () => { if (result) download(new Blob([result.svg], { type: 'image/svg+xml;charset=utf-8' }), 'svg'); });
  $('download-vcf').addEventListener('click', () => { if (result) download(new Blob([result.vcard], { type: 'text/vcard;charset=utf-8' }), 'vcf'); });
  $('download-png').addEventListener('click', () => {
    const current = result;
    if (!current) return;
    canvas.toBlob(blob => {
      if (current !== result) return;
      if (blob) download(blob, 'png'); else setStatus('No pudimos descargar el PNG. Probá con SVG.', true);
    }, 'image/png');
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
