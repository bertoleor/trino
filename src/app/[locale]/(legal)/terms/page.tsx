import Disclaimer from '@/components/shared/disclaimer';

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">Términos y Condiciones — Ley 24.240</h1>
      <p className="mt-2 text-sm">Precios con IVA incluido. Se emite factura C/B electrónica.</p>
      <section className="mt-6 space-y-3 text-sm leading-relaxed">
        <p>
          Conforme Ley 24.240 de Defensa del Consumidor, todos los precios incluyen IVA (21%). En
          checkout se valida precio desde base de datos.
        </p>
        <p>Factura C/B se emite al confirmar pago y se envía por email.</p>
        <p>Domicilio: CABA, Argentina. Contacto: legal@santisimatrinidad.com.ar.</p>
        <p>
          Derecho al olvido: podés solicitar DELETE de tu cuenta. Aplicamos soft delete +
          anonimización a 1 año (365 días).
        </p>
        <p>
          Defensa del Consumidor:{' '}
          <a
            className="underline"
            href="https://www.argentina.gob.ar/produccion/defensadelconsumidor"
          >
            argentina.gob.ar/defensadelconsumidor
          </a>{' '}
          — 0800-666-1518.
        </p>
      </section>
      <div className="mt-6">
        <Disclaimer />
      </div>
    </main>
  );
}
