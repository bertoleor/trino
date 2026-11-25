import { getTranslations } from 'next-intl/server';

function Field({
  label,
  placeholder,
  type = 'text',
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-label text-ink text-xs font-bold uppercase">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        disabled
        className="border-ink bg-cream text-ink placeholder:text-ink/60 min-h-11 w-full border-2 px-3 disabled:opacity-100"
      />
    </label>
  );
}

export async function ContactFields({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'checkout.contact' });

  return (
    <section
      aria-labelledby="checkout-contact-title"
      className="border-ink bg-cream shadow-pop flex flex-col gap-6 border-[3px] p-6"
    >
      <div className="border-ink flex items-center justify-between gap-3 border-b-[3px] pb-4">
        <div>
          <h1 id="checkout-contact-title" className="font-display text-2xl font-semibold">
            {t('hero.title')}
          </h1>
          <p className="font-body mt-1 text-sm">{t('hero.description')}</p>
        </div>
        <span className="font-label border-ink bg-lemon border-2 px-2 py-1 text-xs font-bold uppercase">
          {t('badge')}
        </span>
      </div>

      <fieldset className="flex flex-col gap-4">
        <legend className="font-display font-semibold">{t('details.title')}</legend>
        <Field
          label={t('details.email')}
          placeholder={t('details.emailPlaceholder')}
          type="email"
        />
        <Field label={t('details.phone')} placeholder={t('details.phonePlaceholder')} type="tel" />
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="font-display font-semibold">{t('recipient.title')}</legend>
        <Field label={t('recipient.name')} placeholder={t('recipient.namePlaceholder')} />
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="font-display font-semibold">{t('address.title')}</legend>
        <Field label={t('address.street')} placeholder={t('address.streetPlaceholder')} />
        <Field label={t('address.floor')} placeholder={t('address.floorPlaceholder')} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t('address.postal')} placeholder={t('address.postalPlaceholder')} />
          <Field label={t('address.city')} placeholder={t('address.cityPlaceholder')} />
        </div>
        <Field label={t('address.notes')} placeholder={t('address.notesPlaceholder')} />
      </fieldset>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          disabled
          className="font-label border-ink bg-ink text-cream shadow-pop-sm min-h-12 w-full border-2 px-6 text-xs font-bold uppercase disabled:cursor-not-allowed"
        >
          {t('submit')}
        </button>
        <p className="font-body text-sm">{t('submitNote')}</p>
      </div>
    </section>
  );
}
