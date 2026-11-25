# Nuestro detalle

Página de regalos para parejas: anillos de promesa con compra en Mercado Libre (programa de afiliados).

- `index.html`: la página completa (HTML, CSS y JS en un solo archivo).
- `precio.json`: precios vigentes. Los lee la página al cargar.
- `scripts/actualizar-precio.mjs` + `.github/workflows/precio-semanal.yml`: cada lunes consulta los precios en Mercado Libre y actualiza `precio.json`. Si no puede leer un precio, deja el último y la página avisa que lo consulten en Mercado Libre.

Para agregar un producto: sumarlo a `CATALOGO` en `index.html`, su foto en `img/` y su URL en `scripts/actualizar-precio.mjs`.
