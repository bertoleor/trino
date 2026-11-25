/** 
 * Escaneo de Etiqueta de Remito - Móvil
 * Convertido de Stitch HTML a Next.js + Tailwind
 * 
 * Referencia original: modal_escaneo_de_etiqueta_remito_mobile_trino._beauty
 */

import { Inter, useState } from 'next/font/google';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin', 'greek', 'cyrillic'] });

export const ScanLabelMobile = () => {
  const [code, setCode] = useState('TR-88219');
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    // Simular escaneo después de 2s
    const timer = setTimeout(() => {
      setCode('TR-88220');
      setScanned(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`bg-surface text-on-surface font-body-md text-body-md antialiased flex flex-col min-h-screen ${inter.className}`}>
      {/* Header Fijo */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
        <div className="h-16 px-margin-mobile flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <button aria-label="Volver al Panel" className="w-11 h-11 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors" onClick={() => history.back()}>
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs">
                <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface">Fulfillment Scanner</span>
                <span className="inline-flex items-center px-space-xs py-[2px] rounded-full bg-secondary-container text-on-secondary-fixed font-label-md text-[10px] uppercase font-bold tracking-tight">
                  <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container mr-1 animate-pulse"></span>Palermo Hub
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-xs">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
              </div>
            </div>
          </div>
        </header>

        {/* Sub-header Switch Bar */}
        <div className="flex items-center justify-between mt-space-sm mb-space-md">
          <div className="inline-flex p-1 bg-surface-container rounded-full shadow-sm">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md" onClick={() => history.back()} type="button">
              <span className="material-symbols-outlined text-[16px]">photo_camera</span>
              <span>Cámara</span>
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-on-primary shadow-sm font-label-md text-label-md uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">keyboard</span>
              <span>Manual</span>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-md text-[11px] uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container"></span>Corte 16:30 hs
          </div>
        </div>

        {/* Screen Heading */}
        <div className="mb-space-md">
          <h1 className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-tight flex items-center gap-1.5">
            <span>Ingreso Manual</span>
            <span className="w-2.5 h-2.5 rounded-full bg-on-tertiary-container inline-block"></span>
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Tipeá los dígitos del remito físico, guía o número de orden si el láser no lee el sticker.
          </p>
        </div>

        {/* Quick Shortcut Chips */}
        <div className="mb-space-md">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-label-md text-[11px] uppercase text-on-surface-variant tracking-wider">Pendientes de despacho</span>
            <span className="font-label-md text-[11px] text-on-tertiary-container font-bold">3 en cola</span>
          </div>
          <div className="flex items-center justify-between overflow-x-auto pb-1">
            <button 
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-highest text-on-surface hover:bg-secondary-container transition-colors shadow-sm text-left"
              onClick={() => setCode('TR-88219')}
              type="button"
            >
              <span className="material-symbols-outlined text-[15px] text-on-tertiary-container">bolt</span>
              <span className="font-label-md text-label-md">#TR-88219</span>
              <span className="font-body-sm text-[11px] text-on-surface-variant">· Camila</span>
            </button>
            <button 
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface hover:bg-secondary-container transition-colors shadow-sm text-left"
              onClick={() => setCode('TR-88218')}
              type="button"
            >
              <span className="font-label-md text-label-md">#TR-88218</span>
              <span className="font-body-sm text-[11px] text-on-surface-variant">· Martina</span>
            </button>
            <button 
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface hover:bg-secondary-container transition-colors shadow-sm text-left"
              onClick={() => setCode('TR-88215')}
              type="button"
            >
              <span className="font-label-md text-label-md">#TR-88215</span>
              <span className="font-body-sm text-[11px] text-on-surface-variant">· Lucía</span>
            </button>
          </div>
        </div>

        {/* Code Display Field */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-md mb-space-md">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant">Código de Orden / Remito</span>
            <button className="text-on-surface-variant hover:text-error transition-colors flex items-center gap-1 font-label-md text-label-md uppercase" onClick={() => setCode('')} type="button">
              <span className="material-symbols-outlined text-[15px]">backspace</span>
              <span>Borrar</span>
            </button>
          </div>

          {/* Active Visor */}
          <div className="flex items-center justify-between bg-surface-container px-4 py-3 rounded-lg min-h-[58px]">
            <div className="flex items-center">
              <span className="font-headline-md text-headline-md tracking-wider text-on-surface select-all" id="codeDisplay">
                {code || '—'}
              </span>
              <span className="w-2.5 h-6 bg-primary ml-1 rounded-sm animate-pulse" id="cursorBlink"></span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-fixed font-label-md text-[11px] uppercase font-bold tracking-tight">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              <span>Detectada</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 text-on-surface-variant font-body-sm text-[11px]">
            <span>Formato: TR-XXXXX o 10 dígitos numéricos</span>
            <span className="text-on-tertiary-container font-medium">Lote Palermo CABA</span>
          </div>
        </div>

        {/* Real-Time Order Preview Card */}
        <div className="bg-surface-container-low rounded-xl p-space-md shadow-md mb-space-md transition-all" id="orderPreviewCard">
          <div className="flex items-start justify-between gap-2 mb-space-sm pb-space-xs">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-label-md text-[10px] uppercase font-bold tracking-wider">Moto Express</span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed font-label-md text-[10px] uppercase font-bold">#TR-88219</span>
              </div>
              <div className="font-headline-sm text-[1.125rem] text-on-surface">Camila Navarro</div>
              <div className="font-body-sm text-[12px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[14px] text-on-tertiary-container">stars</span>
                <span className="font-semibold text-on-surface">Socia Club Gold</span>
                <span>· Palermo Soho, CABA</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-headline-sm text-[1.125rem] text-on-surface font-extrabold">$64.350 <span className="text-[11px] font-normal text-on-surface-variant">ARS</span></div>
              <span className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant font-body-sm">
                <span className="material-symbols-outlined text-[13px] text-secondary">credit_card</span>
                Santander Débito
              </span>
            </div>
          </div>

          {/* Items Preview Box */}
          <div className="bg-surface-container-lowest rounded-lg p-space-sm mb-space-sm space-y-2">
            <div className="flex items-center justify-between text-on-surface-variant font-label-md text-[10px] uppercase tracking-wider mb-1">
              <span>Artículos en paquete (2/2 Listos)</span>
              <span className="text-secondary font-bold">Bulto #1 de 1</span>
            </div>

            {/* Item 1 */}
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                <img className="w-full h-full object-cover" data-alt="Close up aesthetic shot of Tower 28 Tinted Lip Balm Sesame color soft clean glossy packaging warm studio light beauty product" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHIy33yf9VLffmZ2-ygasqniibIDPJBvIJSyn_FNcyambLo4a4sIcv14UD6z54jTDbLCSDKIZ_uvbbIlUhNcTr69a9SsSXKSbJkjRFFnoR2uTmBlmB7An3YcdNuQA3Cqvw-pew35CxJaOGln4X6YHpO1ipxbvPxoMG87cucY7QJevMn82JbbirrwgtoI5Un1jg2QHIyW1KbyBtrjzLuG7H5IpsLCV3MdlwhfIMxbbt"/>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-body-sm text-body-sm text-on-surface font-bold truncate">Tower 28 Tinted Lip Balm</p>
                <p className="font-body-sm text-[11px] text-on-surface-variant">Tono Sesame · <span className="font-semibold text-on-surface">Gaveta #04</span></p>
              </div>
              <div className="flex items-center gap-1 bg-surface-container-high px-2 py-0.5 rounded text-on-surface font-label-md text-[11px]">
                <span>1u</span>
                <span className="material-symbols-outlined text-[14px] text-on-tertiary-container">done_all</span>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                <img className="w-full h-full object-cover" data-alt="Aesthetic product photo of Rare Beauty Soft Pinch Liquid Blush Hope soft dewy viral liquid blush packaging studio beauty lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYJSIrcuZhtBohcKAwQio_fAyX4xk04KKhGnwegaf78ipsSH0xmHP2X5A6BbhT8kNlpvbq3hg3LCmaZGZv9-njOsmM_jAjLQHYT2T_b-Uxa2GNTuan4ABQwPKaVAS1Apem9KIZQ-qYlQsY4SZQ-I1nYkbRG3Uud26wiGiEQVNPJdf-Tc2g3xIG186Avexo8fKWYL3b5MPJV_Blhxwh9azk1lwSj0vART0Clk_5-oYp"/>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-body-sm text-body-sm text-on-surface font-bold truncate">Rare Beauty Soft Pinch Blush</p>
                <p className="font-body-sm text-[11px] text-on-surface-variant">Tono Hope · <span className="font-semibold text-on-surface">Gaveta #12</span></p>
              </div>
              <div className="flex items-center gap-1 bg-surface-container-high px-2 py-0.5 rounded text-on-surface font-label-md text-[11px]">
                <span>1u</span>
                <span className="material-symbols-outlined text-[14px] text-on-tertiary-container">done_all</span>
              </div>
            </div>

            {/* Safety Note */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant font-body-sm text-[11px]">
              <span className="material-symbols-outlined text-[15px] text-on-tertiary-container flex-shrink-0">verified_user</span>
              <span className="leading-tight">Precinto de seguridad adhesivo requerido. Sin cambio por bioseguridad.</span>
            </div>
          </div>

          {/* Keypad POS Style */}
          <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm mb-space-lg">
            <div className="grid grid-cols-3 gap-2">
              <button className="h-13 py-3 rounded-lg bg-surface-container-lowest text-on-surface active:bg-secondary-container hover:bg-surface-container font-headline-sm text-headline-sm shadow-sm flex items-center justify-center transition-all select-none" onClick={() => setCode(c => c + '1')} type="button">1</button>
              <button className="h-13 py-3 rounded-lg bg-surface-container-lowest text-on-surface active:bg-secondary-container hover:bg-surface-container font-headline-sm text-headline-sm shadow-sm flex items-center justify-center transition-all select-none" onClick={() => setCode(c => c + '2')} type="button">2</button>
              <button className="h-13 py-3 rounded-lg bg-surface-container-lowest text-on-surface active:bg-secondary-container hover:bg-surface-container font-headline-sm text-headline-sm shadow-sm flex items-center justify-center transition-all select-none" onClick={() => setCode(c => c + '3')} type="button">3</button>
              <button className="h-13 py-3 rounded-lg bg-surface-container-lowest text-on-surface active:bg-secondary-container hover:bg-surface-container font-headline-sm text-headline-sm shadow-sm flex items-center justify-center transition-all select-none" onClick={() => setCode(c => c + '4')} type="button">4</button>
              <button className="h-13 py-3 rounded-lg bg-surface-container-lowest text-on-surface active:bg-secondary-container hover:bg-surface-container font-headline-sm text-headline-sm shadow-sm flex items-center justify-center transition-all select-none" onClick={() => setCode(c => c + '5')} type="button">5</button>
              <button className="h-13 py-3 rounded-lg bg-surface-container-lowest text-on-surface active:bg-secondary-container hover:bg-surface-container font-headline-sm text-headline-sm shadow-sm flex items-center justify-center transition-all select-none" onClick={() => setCode(c => c + '6')} type="button">6</button>
              <button className="h-13 py-3 rounded-lg bg-surface-container-lowest text-on-surface active:bg-secondary-container hover:bg-surface-container font-headline-sm text-headline-sm shadow-sm flex items-center justify-center transition-all select-none" onClick={() => setCode(c => c + '7')} type="button">7</button>
              <button className="h-13 py-3 rounded-lg bg-surface-container-lowest text-on-surface active:bg-secondary-container hover:bg-surface-container font-headline-sm text-headline-sm shadow-sm flex items-center justify-center transition-all select-none" onClick={() => setCode(c => c + '8')} type="button">8</button>
              <button className="h-13 py-3 rounded-lg bg-surface-container-lowest text-on-surface active:bg-secondary-container hover:bg-surface-container font-headline-sm text-headline-sm shadow-sm flex items-center justify-center transition-all select-none" onClick={() => setCode(c => c + '9')} type="button">9</button>
              <button className="h-13 py-3 rounded-lg bg-surface-container-high text-on-surface active:bg-secondary-container hover:bg-surface-variant font-label-lg text-label-lg shadow-sm flex items-center justify-center transition-all select-none uppercase tracking-wider" onClick={() => setCode(c => c + 'TR-')} type="button">TR-</button>
              <button className="h-13 py-3 rounded-lg bg-surface-container-lowest text-on-surface active:bg-secondary-container hover:bg-surface-container font-headline-sm text-headline-sm shadow-sm flex items-center justify-center transition-all select-none" onClick={() => setCode(c => c + '0')} type="button">0</button>
              <button className="h-13 py-3 rounded-lg bg-surface-container-high text-on-surface active:bg-error-container hover:bg-surface-variant font-headline-sm text-headline-sm shadow-sm flex items-center justify-center transition-all select-none" onClick={() => setCode(c => c.slice(0, -1))} type="button">
                <span className="material-symbols-outlined text-[24px]">backspace</span>
              </button>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex flex-col gap-space-sm w-full">
            <button 
              className="w-full py-4 px-space-md rounded-xl bg-primary text-on-primary font-label-lg text-label-lg uppercase tracking-wider shadow-lg hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              onClick={() => {
                setScanned(true);
                setTimeout(() => {
                  alert('Remito validado con éxito: ' + code);
                  setCode('TR-88219');
                  setScanned(false);
                }, 1000);
              }}
              type="button"
            >
              <span>Validar y Despachar Paquete</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
            <button 
              className="w-full py-3 px-space-md rounded-xl bg-surface-container text-on-surface font-label-md text-label-md uppercase tracking-wider hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2"
              onClick={() => history.back()}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              <span>Volver a escanear con cámara</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};