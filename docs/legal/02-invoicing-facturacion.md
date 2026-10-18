# 02 — Facturación ARCA/AFIP (ex-AFIP) — Factura C / B / A

> **Scope:** Cómo facturar en Santísima Trinidad sin generar un documento fiscal inválido.  
> **Trace:** MONEY-01/03 · DOC-01 · PRIV-05 · WEBHOOKS-01 · `supabase/migrations/0002_money_int.sql` · `src/config/env.ts`  
> **Vigencia normativa:** RG AFIP 1415 + 4291 + 5616 (CondicionIVAReceptor obligatoria desde 2025-04-06 para CAE, CAEA desde 2026-06 como solo-contingencia), RG 5762 (clase M → A con retención), RG 5852/2026 posterga obligatoriedad CAE puro al 2026-08-01. WSFEv1 v4.7 + WSBFE.  
> **Disclaimer constitucional:** Este documento es guía operativa, no asesoramiento fiscal. Validar con contador.

---

## 1. Qué le corresponde a Trino

| Situación del emisor | Tipo de comprador | Comprobante a emitir | WS | IVA |
|---|---|---|---|---|
| **Monotributo** (artesanías, hoy lo más probable) | Consumidor final / Exento / Monotributista / RI | **Factura C** (011) | WSFEv1 | No discrimina IVA — `ImpTotConc` = total, array `Iva` vacío |
| **Responsable Inscripto** (si supera monotributo) | Consumidor final / Exento | **Factura B** (006) | WSFEv1 / WSBFE si detalle + NCM | Discriminado 21%/10.5%/27% |
| **Responsable Inscripto** | RI / Monotributista que pide A | **Factura A** (001) | WSFEv1 | Discriminado + `ImpNeto` + `Iva` |
| Exportación | Exterior | **Factura E** (019) | WSFEX | — |

**Regla práctica:** Si no sabés si sos RI o Monotributo, consultá ARCA con CUIT en `padron` y definí `global_settings.facturacion_tipo` = `C` o `A/B`. **No emitir A si sos Monotributo** — ARCA rechaza con error 10015/1417.

---

## 2. CAE vs CAEA — qué usar y cuándo

| Modalidad | Cómo funciona | Cuándo corresponde | Estado 2026 |
|---|---|---|---|
| **CAE** — Código Autorización Electrónico | Request sincrónico a WSFEv1 `FECAESolicitar` con `CbteTipo+PtoVta+CbteNro` + detalle IVA, recibís `CAE` + `CAEFchVto` | **Flujo normal desde 2026-08-01 obligatorio** | **Obligatorio** como principal |
| **CAEA** — CAE Anticipado (quincenal) | Solicitás rango anticipado `FECAEASolicitar`, informás luego `FECAEARegInformativo` | **Solo contingencia** desde 2026-06 | Contingencia únicamente (RG 5782/5785) |

**Implicancia para el sistema:** Para Trino (500 SKUs, tráfico masivo pero bajo volumen fiscal diario), **CAE sincrónico es el camino correcto**. CAEA solo si ARCA está caído (circuit open → cola `pending_retry` + informar CAEA sin movimiento).

```
Checkout pagado → generar factura electrónica (proceso async fuera del request <200ms — RES-03)
  1. Backend toma order.total_cents → convierte a Double (ARCA espera 13+2)
  2. POST FECAESolicitar {PtoVta, CbteTipo, Concepto=1 (producto), DocTipo 99/80/96, DocNro, ImpTotal, MonId=PES Cotiz=1, CondicionIVAReceptorId}
  3. Si 200 + CAE → guardar {cae, cae_vto, cbte_nro, pto_vta} en orders.factura + Storage PDF + email
  4. Si rechazo → DLQ failed_webhooks_log + alertas (OBS-01) — NO reintentar ciegamente
```

---

## 3. Punto de Venta (PtoVta) — alta

- Se da de alta en **AFIP/ARCA → Registro Tributario → Puntos de Venta** o via `FEParamGetPtosVenta`.
- Es un entero de **5 dígitos** desde 2018 (antes 4).
- Cada *sistema* lleva PtoVta distinto:
  - PtoVta **00001** → `Comprobantes en línea` (manual, para pruebas)
  - PtoVta **00002+** → `WSFEv1` (producción app) — recomendado separar `WSFE` vs `WSBFE` vs `Wscon`
- NUNCA reutilizar el mismo PtoVta para manual y WS simultáneamente — duplica numeración y ARCA rechaza 10003.

**Para Trino — recomendado:**
- `PtoVta 00005` → electrónico Trino WSFEv1 (facturas C/B/A del e-commerce) — alta como *Factura electrónica* en ARCA.
- `PtoVta 00001` → respaldo manual (Comprobantes en línea) si WS caído.

Numeración: `FECompUltimoAutorizado(PtoVta, CbteTipo)` + 1. Guardar en DB `facturacion_last_cbte` con lock `FOR UPDATE` para evitar duplicados bajo concurrencia (CONCURRENCIA-01 L2).

---

## 4. Campos ARCA por tipo de comprobante

### Factura C (monotributista — caso Trino probable)

| Campo WSFEv1 | Valor Trino | Obligatorio | Nota |
|---|---|---|---|
| `CbteTipo` | 11 (Factura C) | S | 11=C, 12=ND C, 13=NC C |
| `Concepto` | 1 (Productos) | S | 1=producto, 2=servicio (requiere FchServDesde/Hasta+VtoPago), 3=ambos |
| `DocTipo` | 99 (CF) / 80 (CUIT) / 96 (DNI) | S | CF para ticket anónimo; si cliente da CUIT/DNI usar 80/96 |
| `DocNro` | 0 para CF, o DNI/CUIT | S | 0 si CF sin documento |
| `CondicionIVAReceptorId` | 5=CF, 1=RI, 6=Monotributo, 4=Exento | **S desde 2025-04** | RG 5616 — rechazo si falta en CAE |
| `ImpTotal` | `total_cents/100` | S | Debe = `ImpNeto+ImpTotConc+IVA+...` |
| `ImpTotConc` | 0 (C no tiene) | S | 0 para C |
| `ImpNeto` | `total_cents/100` | S | Neto = total en C |
| `MonId` | `PES` | S | `PES` → `MonCotiz=1` |
| `Iva` (array) | **no enviar** | N | Vacío para C y Bienes Usados |
| `CbteFch` | `yyyymmdd` | S | `CbteFchHsGen` obligatorio desde RG 5782 (2026-08) |

### Factura B / A (si Trino fuese RI)

| Campo | A | B | Nota |
|---|---|---|---|
| `CbteTipo` | 01=A, 02=ND A, 03=NC A | 06=B, 07=ND B, 08=NC B | |
| `Iva` | **obligatorio** `[{Id:5 (21%), BaseImp, Importe}]` | idem | Id 4=10.5%, 5=21%, 6=27%, 3=0% |
| Discriminación | `ImpNeto` + `Iva.Importe` + `ImpTotal = ImpNeto+IVA` | igual | |
| `CondicionIVAReceptorId` | obligatorio | obligatorio | |

Errores frecuentes (códigos ARCA): `10014/10015` (tipo cbte no habilitado), `10244` (CondicionIVA inválido), `15016/17` (CAEA mal usado), `12002` (cotización moneda).

---

## 5. IVA Discriminación — qué mostrar al cliente

| Emisor | Qué ve el cliente | Qué viaja a ARCA |
|---|---|---|
| Monotributo (C) | `AR$ 12.490,00` (sin desglose, leyenda "Monotributista — IVA no discriminado") | `ImpNeto=12490.00` sin array IVA |
| RI Factura B | `Subtotal 10.322,31 + IVA 21% 2.167,69 = 12.490,00 — IVA incluido` | `ImpNeto=10322.31` + `Iva[{Id:5, BaseImp:10322.31, Importe:2167.69}]` |
| RI Factura A | Discriminado completo + CUIT receptor | igual + `Tributos` si percepciones |

**Display (MONEY-02):** Usar `Decimal.js` ROUND_HALF_UP para IVA mostrado; `total_cents` sigue siendo fuente de verdad INT.

---

## 6. Flujo "WSFE free vs manual" — opciones para Trino

### Opción recomendada para MVP (costo cero real)

> **ECOM-04 + DOC-01: La tienda NO emite factura fiscal en el request de checkout.**  
> Checkout genera **comprobante interno** (proforma) con footer obligatorio, y la factura fiscal se emite async (QStash/pg_cron) o manual por contador.

| Paso | Sistema | Costo | Detalle |
|---|---|---|---|
| 1. Checkout `authorized` | App | free | Genera `orders.total_cents` (INT), PDF **interno** en `Storage/receipts/{order_id}.pdf` con footer DOC-01 |
| 2a. Emisión fiscal automática | `cron/facturacion` → WSFEv1 `FECAESolicitar` | free (ARCA WS sin cargo) | Requiere cert WSAA + CUIT + PtoVta + contador habilitado como WSFE. Usar `FECompUltimoAutorizado` para secuencia. |
| 2b. Emisión manual (fallback válido) | Contador en `Comprobantes en línea` | free | El admin marca `factura_emitida_manual: true` + carga `cae` + `cbte_nro` manualmente. App solo registra y envía email. |
| 3. Email al comprador | Resend/QStash | ~100/día free | PDF factura + CAE + vencimiento |

**Cuándo 2a vs 2b:**
- **<30 facturas/mes:** 2b manual es más barato que mantener WSAA (cert anual + renovación + manejo de errores ARCA). Documentar y listo.
- **>100/mes o demanda de factura inmediata:** implementar 2a con cert `cert.p12` en Vault (CRITICAL, rotación 90d), `WSAA` ticket, y `FEDummy` healthcheck 6h (igual que `keepalive`).

Libre `p-limit(5)` + `exponential backoff jitter` máx 5 reintentos (RES-02). Cada intento logueado; 429 → espaciar.

---

## 7. Footer Obligatorio (DOC-01) — SIEMPRE en el comprobante interno

> **"DOCUMENTO NO VALIDO COMO FACTURA. Comprobante interno de operación emitido a los fines de gestión comercial. Este documento no reviste carácter fiscal ni habilita crédito fiscal de IVA."**

Ubicación: pie de PDF interno (`receipts/*` y `orders` email) en 8pt gris grafito, no ocultable. Tipografía lectura, centrado.  
La factura fiscal electrónica llevada por ARCA es el **único** documento válido como factura — el interno nunca la sustituye.

---

## 8. Pendientes & Casos Borde Documentados en el Sistema Actual

### Transferencia bancaria — `pending_verification` (ya implementado)

```
orders.status: pending → pending_verification (comprobante subido presigned)
  → admin approve → pending_verification → authorized (→ processing → shipped)
  → rechaza → canceled (stock re-entry idempotente)
  → sin comprobante 72h → auto-cancel pg_cron (T-D07)
```

- Upload comprobante: `bank_proofs/{order_id}/{uuid}.pdf|jpg` presigned (PERF-06, 10MB max, magic-bytes check).
- Estado `pending_verification` **no** genera factura fiscal; se genera al pasar a `authorized`.
- Admin audit_logs registra `before/after` + `actor_id`.
- Emails async vía QStash/Resend (RES-03, <200ms en request).

### Casos borde

| Caso | Comportamiento |
|---|---|
| Cliente sin CUIT/DNI (consumidor final anónimo) | Factura C/B con `DocTipo 99` `DocNro 0` + `CondicionIVAReceptorId=5` (CF) — ARCA acepta hasta $10000 ARS sin DNI (RG 4291), >$10000 requiere DNI (campo 10014). |
| Nota de Crédito (devolución/cancel) | Emitir NC C (13) o B (08) o A (03) referenciando `CbtesAsoc=[{Tipo, PtoVta, Nro, Cuit}]`. NO borrar la factura — NC anula fiscalmente. |
| Re-emisión duplicada | Idempotencia `processed_events(event_id = cae+cbte)` — segundo intento retorna 200 sin duplicar. |
| ARCA caído | Circuit open 3 fails/60s → guardar `factura_status=pending_retry` + mostrar "Tu factura se enviará por email en breve" — no bloquear entrega. DLQ + cron reintento. |

---

## 9. Checklist Facturación (pre-go-live)

### Alta ARCA (una vez, con contador)

- [ ] CUIT con clave fiscal nivel 3 + cert WSAA (`cert.crt` + `key.key` o `.p12`) si se elige WS automático
- [ ] Punto de Venta electrónico habilitado (00005) en `Registro Tributario` como "Factura electrónica — WSFEv1"
- [ ] RG 4291 adhesión + `FEParamGetPtosVenta` devuelve el PtoVta
- [ ] `CondicionIVAReceptorId` tabla mapeada (1=RI, 4=Exento, 5=CF, 6=Monotributo)
- [ ] `global_settings.facturacion_tipo` = `C` (o `A/B`) + `facturacion_pto_vta` + `facturacion_cuit`

### Por comprobante

- [ ] `price_cents` INT → `ImpTotal` Double con 2 decimales (MONEY-01)
- [ ] `Concepto=1`, `MonId=PES` `MonCotiz=1`, `CbteFch=yyyymmdd`, `CbteFchHsGen` si RG 5782 exige
- [ ] `CondicionIVAReceptorId` enviado (rechazo 10244 si falta)
- [ ] `ImpTotal = ImpNeto+IVA+...` cuadratura exacta (error 10054 si no)
- [ ] Secuencia `FECompUltimoAutorizado+1` con lock FOR UPDATE
- [ ] CAE + `CAEFchVto` guardados + PDF fiscal en Storage + email async
- [ ] Footer DOC-01 presente en todo comprobante interno previo a CAE
- [ ] NC vinculada con `CbtesAsoc` si devolución
- [ ] Health `FEDummy` OK antes de emitir lote

### Manual alternativo (si WS no implementado en MVP)

- [ ] Admin puede marcar `factura_emitida_manual` + cargar `cae`, `cbte_nro`, `pto_vta`, `cae_vto` (validado Zod `cae: z.string().length(14)`)
- [ ] PDF interno sigue con footer DOC-01 hasta que haya CAE
- [ ] Email con "Tu factura fiscal te llegará por separado" si pendiente

---

## 10. Referencias

- ARCA — Facturación Electrónica: https://www.arca.gob.ar/fe/ + Manual Desarrollador WSFEv1 v4.7 (2025-08)
- RG 4291 (CAE/CAEA), RG 5616 (CondicionIVAReceptorId obligatoria), RG 5762 (M→A retención), RG 5782/5785/5852 (CAE obligatorio 2026-08-01)
- `supabase/migrations/0002_money_int.sql` (price_cents) + `0005_events_entitlements.sql` (DLQ/idempotencia) + `0007_order_enum.sql` (estados 9)
- `src/lib/money/fx.ts` (no tocar facturación — solo display)
- `DOCS/LEGAL.md` DOC-01 + `DOCS/TERMS.md` Ley 24.240
