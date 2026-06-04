import axios from 'axios';

export async function obtenerIdDesdeUrlQr(codigoQrEncrypted: string): Promise<string> {
  let urlExternaReal = decodeURIComponent(codigoQrEncrypted);
  
  // Asegurarse de que sea una URL válida para axios
  if (!urlExternaReal.startsWith('http')) {
      throw new Error('La cadena proporcionada no es una URL válida ni un identificador directo admitido.');
  }

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
