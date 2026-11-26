import type { ProductoDetalleCopy } from './producto-detalle-copy';

export const fr: ProductoDetalleCopy = {
  breadcrumb: { label: 'Fil d’Ariane', home: 'Accueil', shop: 'Boutique' },
  banner: {
    label: 'Fiche produit',
    body: 'Informations publiées par l’équipe trino. Lisez la description avant de choisir.',
  },
  gallery: {
    emptyTitle: 'Image indisponible',
    emptyBody: 'Aucune photo n’est encore ajoutée pour ce produit.',
    badge: 'Image du produit',
    detailBadge: 'Galerie',
  },
  purchase: {
    priceLabel: 'Prix final en ARS',
    shadeTitle: 'Teinte',
    shadeMissing: 'Aucune teinte n’est renseignée pour ce produit.',
    addToBag: 'Ajouter au panier',
    save: 'Ajouter aux favoris',
    note: 'Les conditions d’achat sont affichées avant la confirmation de la commande.',
  },
  bundle: {
    eyebrow: 'Comment choisir',
    title: 'Choisissez sereinement',
    body: 'Trois étapes pour consulter la fiche et décider.',
    steps: ['Lire la description', 'Comparer la teinte', 'Vérifier les conditions'],
  },
  compatible: {
    eyebrow: 'Sélection associée',
    title: 'Complétez votre choix',
    cta: 'Voir tout le catalogue',
    emptyTitle: 'Aucun produit associé pour le moment.',
    emptyBody: 'Les produits liés apparaîtront ici une fois disponibles.',
  },
  details: {
    title: 'Détails du produit',
    items: [
      { title: 'Ce que c’est', body: 'Informations de la sélection multimarque trino.' },
      {
        title: 'Mode d’emploi',
        body: 'Lisez toujours l’emballage et suivez les indications du fabricant.',
      },
      { title: 'Ingrédients', body: 'Consultez la liste des ingrédients sur l’emballage.' },
      { title: 'Conditions', body: 'Vérifiez le prix et les conditions au moment du paiement.' },
    ],
  },
  community: {
    eyebrow: 'Communauté trino.',
    title: 'Votre expérience compte',
    body: 'Les expériences partagées par les autres clientes apparaîtront ici.',
    emptyTitle: 'Aucune expérience publiée',
  },
};
