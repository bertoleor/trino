export default function DefensaPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">Defensa del Consumidor — Ley 24.240</h1>
      <section className="mt-4 space-y-3 text-sm leading-relaxed">
        <p>Conforme Ley 24.240, tenés derecho a información clara, trato digno y a reclamar.</p>
        <p>Domicilio del proveedor: CABA, Argentina.</p>
        <p>
          Reclamos ante Defensa del Consumidor:{' '}
          <a
            className="underline"
            href="https://www.argentina.gob.ar/produccion/defensadelconsumidor"
          >
            https://www.argentina.gob.ar/produccion/defensadelconsumidor
          </a>
        </p>
        <p>Teléfono: 0800-666-1518. Todos los precios con IVA incluido, factura C/B emitida.</p>
        <p>
          Derecho al olvido: solicitá DELETE y anonimización a privacidad@santisimatrinidad.com.ar —
          soft delete + anonimización a 1 año.
        </p>
      </section>
    </main>
  );
}
