# Deploy de RUMBO

```
Turista ─> Vercel (frontend/) ── rewrite /api/* ──> API (backend/, FastAPI) ──> Supabase
              └──────────── login Microsoft y reseñas directo ──────────────> Supabase
```

## Ambientes

| Ambiente | Rama | Frontend (Vercel) | Backend (Render) | Supabase | `RUMBO_AMBIENTE` |
| --- | --- | --- | --- | --- | --- |
| Production | `main` | `rumbo-production.vercel.app` | `rumbo-api` (región Virginia) | `rumbo-demo` (`us-east-1`) | `demo` |
| Preview | `develop` | `rumbo-develop.vercel.app` (con login de Vercel) | `rumbo-api-dev` (región Oregon) | `rumbo-dev` (`us-west-2`) | `dev` |
| Local | cualquiera | Vite en `localhost:5173` (`frontend/.env.local`) | uvicorn en `localhost:8000` (`backend/.env`) | `rumbo-dev` | `dev` |

- `rumbo-demo` es producción: sus datos se tratan con cuidado y nunca se usa para desarrollo ni para
  pruebas (`DATABASE_URL_PRUEBAS` va siempre a `rumbo-dev`). Los dos proyectos están en el plan Free de
  Supabase: sin respaldos automáticos y se pausan tras ~7 días sin actividad.
- Solo `main` y `develop` generan deploys en Vercel (`git.deploymentEnabled` en `frontend/vercel.json`);
  las demás ramas no tienen preview.
- Cada backend va en la misma región que su base: Render Oregon ↔ `us-west-2` y Render Virginia ↔
  `us-east-1`. Cada consulta cruza la red, así que separarlos suma latencia a todas las peticiones.

- **Frontend:** Vercel, Root Directory `frontend`. La configuración vive en `frontend/vercel.json`.
  El navegador solo habla con el dominio de Vercel; Vercel reenvía `/api/*` a la API, así que no hay
  CORS y la URL del backend no queda en el bundle. La ruta de `/api/*` lee el destino de la variable
  `BACKEND_URL` de Vercel (servidor, no `VITE_`), que tiene un valor por ambiente: Production va a
  `rumbo-api` y Preview a `rumbo-api-dev`. Es el mismo criterio que elige `VITE_SUPABASE_URL`, así que
  un deploy no puede mezclar el Supabase de un ambiente con el backend del otro. Si la variable falta,
  `/api` falla en vez de caer en el backend equivocado.
- **Backend:** necesita un proceso que siga vivo (tareas cada hora en `app/tareas.py`), así que no va
  en funciones serverless (ni Vercel ni Supabase Edge Functions).
  - Render (Free Web Service), un servicio por ambiente. Producción se crea desde el Blueprint
    `render.yaml` (raíz del repo, rama `main`); `rumbo-api-dev` se creó a mano. Ambos usan: Root Directory `backend`, build
    `pip install uv && uv sync --frozen`, start
    `.venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`, la región de su base
    (tabla de arriba), variables de `oracle/api.env.example` con los valores de su ambiente.
  - Render Free duerme el servicio tras ~15 min sin tráfico (el primer request tarda ~35–60 s) y,
    mientras duerme, **las tareas de cada hora no corren**. Por eso el destino final es Oracle Cloud.
  - Oracle Cloud (VM Always Free): `oracle/rumbo-api.service` (systemd) y `oracle/Caddyfile`
    (HTTPS y reverse proxy, solo `/api/*`).

## Variables

| Dónde | Variable | Valor |
| --- | --- | --- |
| Vercel | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | `rumbo-demo` en Production, `rumbo-dev` en Preview |
| Vercel | `BACKEND_URL` | URL del backend sin `/` al final: `rumbo-api` en Production, `https://rumbo-api-dev.onrender.com` en Preview |
| Backend | `DATABASE_URL`, `SUPABASE_URL`, `RUMBO_AMBIENTE` | los del ambiente del servicio (tabla de arriba) |
| Backend | `ORS_API_KEY`, `TOMTOM_API_KEY` | las mismas en los dos servicios |
| Backend | `TZ=America/Mexico_City` | obligatoria: el backend usa la hora local del servidor |
| Backend | `PYTHON_VERSION` | la del equipo (3.14.4) |

> **El subdominio de Render no es el nombre del servicio.** `rumbo-api.onrender.com` ya es de otra
> persona, así que Render le asigna otro (p. ej. `rumbo-api-xxxx.onrender.com`). Al crear el servicio,
> copiar su URL real a `BACKEND_URL` (Production) en Vercel y redesplegar.

Vercel lee las variables al crear cada deploy: después de cambiar `BACKEND_URL` hay que redesplegar
(Deployments → ⋯ → Redeploy, **desmarcando** "Use project's Ignore Build Step"; si no, el
`ignoreCommand` ve que el código no cambió y cancela el build). Al migrar a Oracle solo cambia el valor
de `BACKEND_URL`.

Lo que empieza con `VITE_` termina en el bundle público: nunca poner ahí `DATABASE_URL` ni claves de
APIs.

En Supabase (Authentication → URL Configuration), `rumbo-demo` tiene Site URL
`https://rumbo-production.vercel.app`; `rumbo-dev` deja `http://localhost:5173` y acepta en Redirect URLs
`rumbo-develop.vercel.app` y `rumbo-*-rumbo-b663.vercel.app` (previews de ramas).

## Sin Ollama

El asistente responde 503 (`SinOllama`) y el chat muestra `chat.noDisponible`; el resto de la app
sigue igual. `/api/salud` reporta `ollama.disponible`.
