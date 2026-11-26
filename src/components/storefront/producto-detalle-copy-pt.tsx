import type { ProductoDetalleCopy } from './producto-detalle-copy';

export const ptBR: ProductoDetalleCopy = {
  breadcrumb: { label: 'Navegação', home: 'Início', shop: 'Loja' },
  banner: {
    label: 'Ficha do produto',
    body: 'Informações publicadas pela equipe trino. Leia a descrição antes de escolher.',
  },
  gallery: {
    emptyTitle: 'Imagem indisponível',
    emptyBody: 'Ainda não há uma foto cadastrada para este produto.',
    badge: 'Imagem do produto',
    detailBadge: 'Galeria',
  },
  purchase: {
    priceLabel: 'Preço final em ARS',
    shadeTitle: 'Tom',
    shadeMissing: 'Este produto não tem um tom cadastrado.',
    addToBag: 'Adicionar à sacola',
    save: 'Salvar nos favoritos',
    note: 'As condições de compra aparecem antes de confirmar o pedido.',
  },
  bundle: {
    eyebrow: 'Como escolher',
    title: 'Escolha com calma',
    body: 'Três passos para conferir a ficha e decidir.',
    steps: ['Leia a descrição', 'Compare o tom', 'Confira as condições'],
  },
  compatible: {
    eyebrow: 'Combinação selecionada',
    title: 'Complete sua escolha',
    cta: 'Ver todo o catálogo',
    emptyTitle: 'Ainda não há produtos relacionados.',
    emptyBody: 'Os produtos vinculados aparecem aqui quando estiverem disponíveis.',
  },
  details: {
    title: 'Detalhes do produto',
    items: [
      { title: 'O que é', body: 'Informações da seleção multimarca trino.' },
      { title: 'Como usar', body: 'Leia sempre a embalagem e siga as instruções do fabricante.' },
      { title: 'Ingredientes', body: 'Confira a lista de ingredientes na embalagem do produto.' },
      { title: 'Condições', body: 'Confira preço e condições no checkout antes de confirmar.' },
    ],
  },
  community: {
    eyebrow: 'Comunidade trino.',
    title: 'Sua experiência importa',
    body: 'As experiências compartilhadas por outras clientes aparecem aqui.',
    emptyTitle: 'Ainda não há experiências publicadas',
  },
};
