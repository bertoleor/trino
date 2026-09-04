import CookieConsent from "@/components/shared/cookie-consent";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">Privacidad / Privacy</h1>
      <p className="mt-4 text-sm">Gestiona tu consentimiento granular: esencial, analitica y marketing. Sin consentimiento marketing, Resend no envia emails promocionales.</p>
      <section className="mt-6 space-y-2 text-sm">
        <h2 className="font-semibold">Cookies esenciales</h2>
        <p>Sesión, carrito, seguridad. Siempre activas.</p>
        <h2 className="font-semibold">Cookies analiticas</h2>
        <p>Medición anonima. Requiere consentimiento.</p>
        <h2 className="font-semibold">Cookies marketing (Resend)</h2>
        <p>Emails transaccionales y promocionales via Resend. Bloqueadas hasta consentimiento granular marketing.</p>
      </section>
      <CookieConsent />
    </main>
  );
}
