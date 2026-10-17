import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// Identificación del vendedor (P-04, CCyC 1100 + L.24240 art.4 + Res.244/21).
// Fuente de verdad: tabla `global_settings` (CMS-01, editable por admin sin deploy)
// con fallback a variables de entorno server-side. NUNCA hardcodear en JSX.
//
// Keys (obligatorias, decididas por orquestador): RAZON_SOCIAL, CUIT, CONDICION_FISCAL,
// DOMICILIO_LEGAL, EMAIL_LEGAL, TELEFONO_LEGAL, y para facturación FACTURACION_TIPO,
// FACTURACION_PTO_VTA, FACTURACION_CUIT. Los nombres snake_case son las columnas de
// `global_settings`; los nombres SCREAMING_SNAKE son las variables de entorno de fallback.

export interface MerchantIdentity {
  razonSocial: string;
  cuit: string;
  condicionFiscal: string;
  domicilioLegal: string;
  emailLegal: string;
  telefonoLegal: string;
  facturacionTipo: string;
  facturacionPtoVta: string;
  facturacionCuit: string;
}

// Placeholder seguro: mientras el dueño no aporte el dato real, renderizar esto.
// NUNCA inventar un CUIT/razón social ficticio.
export const CUIT_PLACEHOLDER = 'CUIT: pendiente de carga';
const PENDING = 'pendiente de carga';

// Columna snake_case en `global_settings` -> variable de entorno de fallback.
const COLUMN_TO_ENV: ReadonlyArray<readonly [keyof MerchantIdentity, string, string]> = [
  ['razonSocial', 'razon_social', 'RAZON_SOCIAL'],
  ['cuit', 'cuit', 'CUIT'],
  ['condicionFiscal', 'condicion_fiscal', 'CONDICION_FISCAL'],
  ['domicilioLegal', 'domicilio_legal', 'DOMICILIO_LEGAL'],
  ['emailLegal', 'email_legal', 'EMAIL_LEGAL'],
  ['telefonoLegal', 'telefono_legal', 'TELEFONO_LEGAL'],
  ['facturacionTipo', 'facturacion_tipo', 'FACTURACION_TIPO'],
  ['facturacionPtoVta', 'facturacion_pto_vta', 'FACTURACION_PTO_VTA'],
  ['facturacionCuit', 'facturacion_cuit', 'FACTURACION_CUIT'],
];

function firstNonEmpty(...values: Array<string | undefined | null>): string {
  for (const v of values) {
    const s = typeof v === 'string' ? v.trim() : '';
    if (s) return s;
  }
  return '';
}

function safeIdentity(raw: Partial<Record<keyof MerchantIdentity, string>>): MerchantIdentity {
  return {
    razonSocial: firstNonEmpty(raw.razonSocial),
    cuit: firstNonEmpty(raw.cuit),
    condicionFiscal: firstNonEmpty(raw.condicionFiscal),
    domicilioLegal: firstNonEmpty(raw.domicilioLegal),
    emailLegal: firstNonEmpty(raw.emailLegal),
    telefonoLegal: firstNonEmpty(raw.telefonoLegal),
    facturacionTipo: firstNonEmpty(raw.facturacionTipo),
    facturacionPtoVta: firstNonEmpty(raw.facturacionPtoVta),
    facturacionCuit: firstNonEmpty(raw.facturacionCuit),
  };
}

/**
 * Lee la identidad del vendedor desde `global_settings` (CMS-01) con fallback a
 * variables de entorno. Devuelve cadenas vacías cuando el dato falta; el caller
 * renderiza el placeholder seguro (nunca un CUIT ficticio).
 */
export async function getMerchantIdentity(): Promise<MerchantIdentity> {
  let row: Record<string, unknown> | null | undefined;
  try {
    const supabase = await createClient();
    const columns = COLUMN_TO_ENV.map(([, col]) => col).join(',');
    const { data } = await supabase.from('global_settings').select(columns).limit(1).maybeSingle();
    row = data as Record<string, unknown> | null;
  } catch (e) {
    logger.warn('merchant identity fallback to env vars', {
      route: 'merchant/identity',
      error: String(e),
    });
    row = null;
  }

  const merged: Partial<Record<keyof MerchantIdentity, string>> = {};
  for (const [key, col, envName] of COLUMN_TO_ENV) {
    const dbValue = row?.[col];
    const envValue = process.env[envName];
    merged[key] = firstNonEmpty(typeof dbValue === 'string' ? dbValue : '', envValue);
  }

  return safeIdentity(merged);
}

/**
 * Devuelve el CUIT ya seguro para render: el valor real o el placeholder visible.
 * Nunca retorna un CUIT inventado.
 */
export function cuitForDisplay(cuit: string): string {
  return cuit || CUIT_PLACEHOLDER;
}

/**
 * Devuelve el valor o el placeholder genérico "pendiente de carga".
 */
export function valueForDisplay(value: string): string {
  return value || PENDING;
}
