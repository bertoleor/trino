import { notFound } from 'next/navigation';

// Unmatched locale-prefixed paths need a segment that throws so the localized
// [locale]/not-found.tsx renders inside the storefront layout.
export default function LocaleCatchAll() {
  notFound();
}
