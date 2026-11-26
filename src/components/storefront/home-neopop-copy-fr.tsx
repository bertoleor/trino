import type { HomeNeopopCopy } from './home-neopop-copy';

export const fr: HomeNeopopCopy = {
  hero: {
    eyebrow: 'Sélection multimarque',
    titleLead: 'Une beauté qui fait',
    titleAccent: 'du bruit.',
    highlight: 'Votre prochaine préférée',
    body: 'Découvrez des cosmétiques de marques sélectionnées et trouvez ce qui vous plaît.',
    primaryCta: 'Voir la boutique',
    secondaryCta: 'Découvrir le guide des teintes',
    visualLabel: 'Choix en vedette',
    visualHint: 'De vrais produits du catalogue',
  },
  ticker: {
    items: [
      'Sélection multimarque',
      'Prix finaux en ARS',
      'Informations claires sur chaque fiche',
      'Achetez à votre rythme',
    ],
  },
  brands: {
    eyebrow: 'Marques en vedette',
    title: 'Marques à découvrir',
    body: 'Parcourez une sélection pensée pour révéler de nouveaux favoris.',
    cta: 'Voir les produits',
    items: [
      { name: 'Tower 28', detail: 'Soin et couleur au quotidien' },
      { name: 'Rare Beauty', detail: 'Des couleurs aux finitions douces' },
      { name: 'Saie', detail: 'Textures lumineuses' },
      { name: 'Summer Fridays', detail: 'Baumes et soins des lèvres' },
    ],
  },
  featured: {
    eyebrow: 'Nouveautés',
    title: 'Les derniers produits',
    chips: ['Tout', 'Lèvres', 'Visage', 'Catalogue'],
    emptyTitle: 'Aucun produit publié',
    emptyBody: 'Les produits apparaîtront ici une fois le catalogue chargé.',
  },
  guide: {
    eyebrow: 'Guide des teintes',
    title: 'Vous ne savez pas par où commencer ?',
    body: 'Un court guide pour comparer les teintes et choisir plus sereinement.',
    steps: ['Observer votre teinte', 'Comparer les options', 'Choisir une préférée'],
    cta: 'Ouvrir le guide',
    cardTitle: 'Orientation simple',
    cardLabel: 'Question 1 sur 3',
    cardQuestion: 'Quelle finition préférez-vous ?',
    options: ['Naturelle', 'Lumineuse', 'Intense'],
    footnote: 'Une orientation, pas une promesse.',
  },
  community: {
    eyebrow: 'Communauté',
    title: 'Ce qui se passe chez trino.',
    body: 'Les expériences partagées par les clientes apparaîtront ici.',
    emptyTitle: 'Aucune expérience publiée',
    emptyBody: 'Les avis s’afficheront ici une fois activés.',
  },
  reviews: {
    eyebrow: 'Avis',
    title: 'Expériences des clientes',
    body: 'Nous affichons uniquement les avis liés à des achats vérifiés.',
    emptyTitle: 'Aucun avis publié',
    emptyBody: 'Il n’y a pas encore d’avis vérifié à afficher.',
  },
  quality: {
    eyebrow: 'Critères de sélection',
    title: 'Des produits aux informations claires',
    body: 'Nous publions données, prix et conditions sans promesses inventées.',
    cta: 'Voir les conditions',
  },
};
