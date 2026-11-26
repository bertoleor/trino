import type { ProductoDetalleCopy } from './producto-detalle-copy';

export const esAR: ProductoDetalleCopy = {
  breadcrumb: { label: 'Ubicación en el sitio', home: 'Inicio', shop: 'Tienda' },
  banner: {
    label: 'Ficha de producto',
    body: 'Datos publicados por el equipo de trino. Revisá la descripción antes de elegir.',
  },
  gallery: {
    emptyTitle: 'Imagen no disponible',
    emptyBody: 'Todavía no hay una foto cargada para este producto.',
    badge: 'Imagen del producto',
    detailBadge: 'Galería',
  },
  purchase: {
    priceLabel: 'Precio final en ARS',
    shadeTitle: 'Tono',
    shadeMissing: 'Este producto no tiene un tono cargado.',
    addToBag: 'Agregar a la bolsa',
    save: 'Guardar en favoritos',
    note: 'Las condiciones de compra se muestran antes de confirmar el pedido.',
  },
  bundle: {
    eyebrow: 'Cómo elegir',
    title: 'Elegí con calma',
    body: 'Tres pasos para revisar la ficha y decidir.',
    steps: ['Leé la descripción', 'Compará el tono', 'Revisá las condiciones'],
  },
  compatible: {
    eyebrow: 'Curaduría compatible',
    title: 'Completá tu selección',
    cta: 'Ver todo el catálogo',
    emptyTitle: 'No hay productos relacionados por ahora.',
    emptyBody: 'Cuando haya productos vinculados, vas a verlos acá.',
  },
  details: {
    title: 'Detalle del producto',
    items: [
      { title: 'Qué es', body: 'Datos de la selección multimarca de trino.' },
      {
        title: 'Modo de uso',
        body: 'Leé siempre el envase y seguí las indicaciones del fabricante.',
      },
      {
        title: 'Ingredientes',
        body: 'Consultá la lista de ingredientes en el envase del producto.',
      },
      {
        title: 'Condiciones',
        body: 'Revisá precio y condiciones en el checkout antes de confirmar.',
      },
    ],
  },
  community: {
    eyebrow: 'Comunidad trino.',
    title: 'Tu experiencia cuenta',
    body: 'Acá vas a poder ver las experiencias que compartan otras clientas.',
    emptyTitle: 'Todavía no hay experiencias publicadas',
  },
};
