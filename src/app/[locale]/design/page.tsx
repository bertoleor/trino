import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductCardSkeleton } from '@/components/ui/skeleton';

export default function DesignPage() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-bold">trino. — Bauhaus Design System</h1>
      <p className="mt-2 text-zinc-600">Hidden showcase — not linked in navigation.</p>
      <section className="mt-8 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Buttons — pill 9999, 44px</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button>agregar al carrito.</Button>
            <Button variant="secondary">ver más.</Button>
            <Button variant="outline">outline.</Button>
            <Button variant="ghost">ghost.</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Badges & Inputs</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Badge>30% off.</Badge>
            <Badge variant="success">nuevo.</Badge>
            <Input placeholder="buscar..." aria-label="buscar" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Skeletons — exact geometry</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
