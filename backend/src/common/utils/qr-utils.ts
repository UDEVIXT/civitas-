import axios from 'axios';

export async function obtenerIdDesdeUrlQr(codigoQrEncrypted: string): Promise<string> {
  const urlExternaReal = decodeURIComponent(codigoQrEncrypted);
  //console.log(`Haciendo petición desde el servidor a: ${urlExternaReal}`);

  const respuestaExterna = await axios.get(urlExternaReal);
  const htmlCompleto = respuestaExterna.data;

  const match = htmlCompleto.match(/<p>([\s\S]*?)<\/p>/);
  if (!match || !match[1]) {
    throw new Error('No se pudo encontrar el código de acceso en el HTML del QR.');
  }

  const idLimpio = match[1].trim();
  //console.log(`ID: ${idLimpio}`);
  return idLimpio;
}
