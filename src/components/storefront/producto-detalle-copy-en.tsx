import type { ProductoDetalleCopy } from './producto-detalle-copy';

export const en: ProductoDetalleCopy = {
  breadcrumb: { label: 'Breadcrumb', home: 'Home', shop: 'Shop' },
  banner: {
    label: 'Product details',
    body: 'Information published by the trino team. Read the description before choosing.',
  },
  gallery: {
    emptyTitle: 'Image unavailable',
    emptyBody: 'No photo has been uploaded for this product yet.',
    badge: 'Product image',
    detailBadge: 'Gallery',
  },
  purchase: {
    priceLabel: 'Final price in ARS',
    shadeTitle: 'Shade',
    shadeMissing: 'No shade is listed for this product.',
    addToBag: 'Add to bag',
    save: 'Save to wishlist',
    note: 'Purchase terms are shown before you confirm the order.',
  },
  bundle: {
    eyebrow: 'How to choose',
    title: 'Choose with confidence',
    body: 'Three steps to review the details and decide.',
    steps: ['Read the description', 'Compare the shade', 'Review the terms'],
  },
  compatible: {
    eyebrow: 'Curated pairing',
    title: 'Complete your selection',
    cta: 'See the whole catalog',
    emptyTitle: 'No related products yet.',
    emptyBody: 'Linked products will appear here once available.',
  },
  details: {
    title: 'Product details',
    items: [
      { title: 'What it is', body: 'Information from the trino multi-brand selection.' },
      {
        title: 'How to use',
        body: 'Always read the package and follow the manufacturer instructions.',
      },
      { title: 'Ingredients', body: 'Check the ingredient list on the product package.' },
      { title: 'Terms', body: 'Review price and terms at checkout before confirming.' },
    ],
  },
  community: {
    eyebrow: 'trino. community',
    title: 'Your experience matters',
    body: 'Experiences shared by other customers will appear here.',
    emptyTitle: 'No experiences published yet',
  },
};
