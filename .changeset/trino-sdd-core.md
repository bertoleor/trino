---
'santisima-trinidad': minor
---

E-commerce engine: SSE batch de shipping agrupado por `postal_code` (`ReadableStream`,
`requireRole editor`), labels A4/ZPL, Customer360 LTV single-join con RPC fallback, auth-sync en
tiempo real (BroadcastChannel + storage fallback <1s), integración RLS two-role con `has_role`
DEFINER, proxy deny-default con gate de jerarquía 403 y headers `Cache-Control` público/privado por
ruta.
