// Lee el precio de cada publicación en Mercado Libre y actualiza precio.json.
// Si Mercado Libre bloquea la lectura o el dato no es confiable, NO pisa el precio de ese producto:
// deja el último valor y marca "consultar": true para que la página avise.
import { readFileSync, writeFileSync } from 'node:fs';

const PRINCIPAL = 'https://www.mercadolibre.com.ar/p/MLAU1250550473';
const PRODUCTOS = {
  estuche: 'https://www.mercadolibre.com.ar/set-vip-2-anillos-corazon-promesa-pareja-novios-estuche-pana/up/MLAU3738948337',
  iloveyou: 'https://articulo.mercadolibre.com.ar/MLA-1599033961-2-alianzas-vip-corazon-i-love-you-real-pareja-novios-anillos-_JM',
  modernos: 'https://www.mercadolibre.com.ar/anillo-alianzas-promesa-hombre-y-mujer-ajustables-modernos/up/MLAU2776669763',
  elegantes: 'https://www.mercadolibre.com.ar/2-anillos-de-pareja-elegantes-compromiso-zirconia-blancos/up/MLAU232055351',
  endless: 'https://www.mercadolibre.com.ar/anillos-pareja-novios-corazon-endless-love-x2-regulables/up/MLAU227197871',
};
const ARCHIVO = new URL('../precio.json', import.meta.url);
const actual = JSON.parse(readFileSync(ARCHIVO, 'utf8'));

async function leer(url, anterior) {
  const r = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
      'accept-language': 'es-AR,es;q=0.9',
    },
    redirect: 'follow',
  });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const html = await r.text();
  const m = html.match(/itemprop="price"\s+content="([\d.]+)"/) || html.match(/"price":\s*([\d.]+)/);
  const precio = m ? parseFloat(m[1]) : NaN;
  // Validación: número razonable y sin saltos locos respecto del último precio
  if (!isFinite(precio) || precio < 1000 || precio > anterior * 2.5 || precio < anterior / 2.5) {
    throw new Error('Precio no confiable: ' + m?.[1]);
  }
  return precio;
}

const hoy = new Date().toISOString().slice(0, 10);
const salida = { ...actual, productos: { ...(actual.productos || {}) } };

// Producto principal
try {
  salida.precio = await leer(PRINCIPAL, actual.precio);
  salida.actualizado = hoy;
  salida.consultar = false;
  console.log('Principal:', salida.precio);
} catch (e) {
  console.error('Principal: no se pudo leer:', e.message);
  salida.consultar = true;
}

// Resto de los anillos
for (const [id, url] of Object.entries(PRODUCTOS)) {
  const previo = actual.productos?.[id]?.precio;
  if (!previo) continue;
  try {
    const precio = await leer(url, previo);
    salida.productos[id] = { precio, actualizado: hoy, consultar: false };
    console.log(id + ':', precio);
  } catch (e) {
    console.error(id + ': no se pudo leer:', e.message);
    salida.productos[id] = { ...actual.productos[id], consultar: true };
  }
}

writeFileSync(ARCHIVO, JSON.stringify(salida, null, 2) + '\n');
