# Deploy de RUMBO

```
Turista ─> Vercel (frontend/) ── rewrite /api/* ──> API (backend/, FastAPI) ──> Supabase
              └──────────── login Microsoft y reseñas directo ──────────────> Supabase
```

## Ambientes

| Ambiente | Rama | Frontend (Vercel) | Backend (Render) | Supabase | `RUMBO_AMBIENTE` |
| --- | --- | --- | --- | --- | --- |
| Production | `main` | `rumbo-production.vercel.app` | `rumbo-api` | `rumbo-demo` | `demo` |
| Preview | `develop` (y demás ramas) | `rumbo-develop.vercel.app` | `rumbo-api-dev` | `rumbo-dev` | `dev` |

- **Frontend:** Vercel, Root Directory `frontend`. La configuración vive en `frontend/vercel.json`.
  El navegador solo habla con el dominio de Vercel; Vercel reenvía `/api/*` a la API, así que no hay
  CORS y la URL del backend no queda en el bundle. El rewrite elige el backend por dominio: los
  dominios de producción van a `rumbo-api`; cualquier otro (previews) va a `rumbo-api-dev`.
- **Backend:** necesita un proceso que siga vivo (tareas cada hora en `app/tareas.py`), así que no va
  en funciones serverless (ni Vercel ni Supabase Edge Functions).
  - Render (Free Web Service), un servicio por ambiente: Root Directory `backend`, build
    `pip install uv && uv sync --frozen`, start
    `.venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`, región Oregon (la de
    Supabase), variables de `oracle/api.env.example` con los valores de su ambiente.
  - Oracle Cloud (VM Always Free): `oracle/rumbo-api.service` (systemd) y `oracle/Caddyfile`
    (HTTPS y reverse proxy, solo `/api/*`).

## Variables

| Dónde | Variable | Valor |
| --- | --- | --- |
| Vercel | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | `rumbo-demo` en Production, `rumbo-dev` en Preview |
| Backend | `DATABASE_URL`, `SUPABASE_URL`, `RUMBO_AMBIENTE` | los del ambiente del servicio (tabla de arriba) |
| Backend | `ORS_API_KEY`, `TOMTOM_API_KEY` | las mismas en los dos servicios |
| Backend | `TZ=America/Mexico_City` | obligatoria: el backend usa la hora local del servidor |
| Backend | `PYTHON_VERSION` | la del equipo (3.14.4) |

Lo que empieza con `VITE_` termina en el bundle público: nunca poner ahí `DATABASE_URL` ni claves de
APIs.

En Supabase (Authentication → URL Configuration), `rumbo-demo` tiene Site URL
`https://rumbo-production.vercel.app`; `rumbo-dev` deja `http://localhost:5173` y acepta en Redirect URLs
`rumbo-develop.vercel.app` y `rumbo-*-rumbo-b663.vercel.app` (previews de ramas).

## Sin Ollama

El asistente responde 503 (`SinOllama`) y el chat muestra `chat.noDisponible`; el resto de la app
sigue igual. `/api/salud` reporta `ollama.disponible`.
