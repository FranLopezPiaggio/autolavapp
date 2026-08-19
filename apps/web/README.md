# autolavapp — Web (Admin Dashboard)

Frontend React (Vite + TypeScript) del MVP CRM/ERP para autolavados y detailing.
Panel admin para gestionar órdenes de lavado, disponibilidad y métricas del negocio.

## Stack

- React 19 + Vite + TypeScript
- React Router (auth flow + rutas protegidas)
- Axios (`src/lib/api.ts`) — base URL desde `VITE_API_URL` (default `http://localhost:3000/api`), inyecta `jwt_token` del localStorage
- Lucide icons

## Scripts

```bash
pnpm dev        # dev server
pnpm build      # build de producción
pnpm lint       # eslint
```

## Endpoints consumidos

| Endpoint    | Uso                        |
| ----------- | -------------------------- |
| `/auth/login` | Login (token JWT)        |
| `/auth/me`  | Sesión actual              |
| `/dashboard/summary` | KPIs del dashboard |
| `/orders`   | Órdenes (listado/creación) |
| `/availability` | Chequeo de disponibilidad |

Para levantar el stack completo (API + DB) ver el README raíz del repo.