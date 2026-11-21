# Deploy de RUMBO

```
Turista ─> Vercel (frontend/) ── rewrite /api/* ──> API (backend/, FastAPI) ──> Supabase rumbo-demo
              └──────────── login Microsoft y reseñas directo ──────────────────> Supabase
```

- **Frontend:** Vercel, Root Directory `frontend`. La configuración vive en `frontend/vercel.json`.
  El navegador solo habla con el dominio de Vercel; Vercel reenvía `/api/*` a la API, así que no hay
  CORS y la URL del backend no queda en el bundle. Cambiar de host del backend = cambiar el
  `destination` del primer rewrite.
- **Backend:** necesita un proceso que siga vivo (tareas cada hora en `app/tareas.py`), así que no va
  en funciones serverless (ni Vercel ni Supabase Edge Functions).
  - Render (Free Web Service): Root Directory `backend`, build `pip install uv && uv sync --frozen`,
    start `uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT`, variables de
    `oracle/api.env.example` más `TZ=America/Mexico_City`.
  - Oracle Cloud (VM Always Free): `oracle/rumbo-api.service` (systemd) y `oracle/Caddyfile`
    (HTTPS y reverse proxy, solo `/api/*`).

## Variables

| Dónde | Variable | Valor |
| --- | --- | --- |
| Vercel | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | `rumbo-demo` en Production, `rumbo-dev` en Preview |
| Backend | `DATABASE_URL`, `SUPABASE_URL`, `RUMBO_AMBIENTE=demo`, `ORS_API_KEY`, `TOMTOM_API_KEY` | `rumbo-demo` |
| Backend | `TZ=America/Mexico_City` | obligatoria: el backend usa la hora local del servidor |

Lo que empieza con `VITE_` termina en el bundle público: nunca poner ahí `DATABASE_URL` ni claves de
APIs.

## Sin Ollama

El asistente responde 503 (`SinOllama`) y el chat muestra `chat.noDisponible`; el resto de la app
sigue igual. `/api/salud` reporta `ollama.disponible`.
