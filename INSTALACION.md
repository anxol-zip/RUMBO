# Instalación

Cómo correr RUMBO en una computadora, en **Windows (PowerShell)** y **Linux (bash/zsh)**. Hay dos formas:

| Modo | Para qué | Qué necesita |
|---|---|---|
| **Desarrollo** | Trabajar en la interfaz en cualquier computadora | `backend/.env` con la URL de `rumbo-dev` (Supabase) e internet |
| **Datos reales** | La demo, la presentación y las pruebas con usuarios | `backend/.env` con la URL de `rumbo-demo` y las claves, `backend/data/raw/` (se copia a mano) y Ollama para el asistente |

Los pasos 1 y 2 son iguales para los dos modos. Después sigue el paso 3 (desarrollo) o el 4 (datos reales).

## 1. Programas

Versiones que pide el proyecto: **Python ≥ 3.12** (lo instala `uv`), **Node ≥ 22.12** (lo exige Vite 8) y, solo para el asistente, **Ollama**.

**Windows.** Si alguno ya está instalado, `winget` lo dice y no pasa nada:

```powershell
winget install --id Git.Git -e
winget install --id astral-sh.uv -e
winget install --id OpenJS.NodeJS.LTS -e
winget install --id Ollama.Ollama -e      # solo para el modo con datos reales
```

Cierra y abre la terminal para que se actualice el `PATH`.

**Linux (Ubuntu).**

```bash
sudo apt update && sudo apt install -y git curl
curl -LsSf https://astral.sh/uv/install.sh | sh                 # uv
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs                                      # Node 24 LTS
curl -fsSL https://ollama.com/install.sh | sh                   # Ollama: solo para el modo con datos reales
```

Abre una terminal nueva y revisa:

```bash
git --version; uv --version; node -v
```

## 2. Repositorio y dependencias

El trabajo integrado está en **`develop`**:

```bash
git clone -b develop https://github.com/anxol-zip/RUMBO.git
cd RUMBO
cd backend && uv sync && cd ..
cd frontend && npm ci && cd ..
```

En Windows, PowerShell acepta `\` y `/` en las rutas.

## 3. Modo de desarrollo

La base está en la nube, en **Supabase** (PostgreSQL). Hay dos proyectos:

| Proyecto | Para qué | Cómo se carga |
|---|---|---|
| `rumbo-dev` | Desarrollo y pruebas automáticas. La comparte todo el equipo | `herramientas/bd_desarrollo.py` (este paso) |
| `rumbo-demo` | La demo, la presentación y las pruebas con usuarios | Pipeline completo (paso 4.4) |

`rumbo-dev` ya tiene los 23 lugares reales, sus horarios, los eventos y la afluencia estimada de 14 días. Sin internet no hay app: el backend responde 503 hasta que vuelve la conexión.

### 3.1 Tu `backend/.env`

Pide a Axel la URL de conexión de `rumbo-dev` (por mensaje privado, nunca en el grupo). Copia la plantilla y llénala:

```bash
# Linux
cp backend/.env.example backend/.env
```

```powershell
# Windows
Copy-Item backend\.env.example backend\.env
```

Ábrelo para editarlo:

```bash
# Linux
nano backend/.env          # guarda con Ctrl+O y Enter; sal con Ctrl+X
```

```powershell
# Windows
notepad backend\.env       # guarda con Ctrl+S. Debe quedar como ".env", no ".env.txt"
```

Cambia:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | La URL de `rumbo-dev` (Supabase → **Connect** → **Session pooler**, puerto 5432) |
| `RUMBO_AMBIENTE` | `dev` |
| `DATABASE_URL_PRUEBAS` | La misma URL de `rumbo-dev` (quítale el `#`). Sin ella, las pruebas que usan base se saltan |

> `backend/.env` **nunca** se sube a git ni se pega en un chat: tiene la contraseña de la base. El `.gitignore` ya lo excluye.

### 3.2 Levantar la app

Se abren **dos terminales**, una para el backend y otra para el frontend.

**Terminal 1: backend**

```bash
# Linux
cd backend
PUEBLA_TAREAS=0 uv run uvicorn app.main:app --reload --port 8000
```

```powershell
# Windows
cd backend
$env:PUEBLA_TAREAS = '0'
uv run uvicorn app.main:app --reload --port 8000
```

- El backend lee `DATABASE_URL` de `backend/.env`.
- `PUEBLA_TAREAS=0` apaga la actualización de cada hora, que necesita las claves de ORS y TomTom.
- En Windows, la variable se queda en esa terminal; quítala con `Remove-Item Env:PUEBLA_TAREAS` o abre otra terminal.

**Terminal 2: frontend**

```bash
cd frontend
npm run dev               # http://localhost:5173; los cambios se ven al guardar
```

Abre **http://localhost:5173**.

**En qué se diferencia de `rumbo-demo`:**

- **Traslados aproximados:** se calculan con la distancia en línea recta, porque OpenRouteService necesita una clave.
- **Sin clima ni tráfico:** el semáforo los toma como "sin lluvia" y "sin tráfico".
- **Sin asistente:** sin Ollama, el asistente responde que no está disponible.
- **Aviso en pantalla:** la lista dice que son datos de demostración, como pide el proyecto. Aparece solo cuando la base no tiene clima.
- **Hora real:** el semáforo es el de la hora actual. De noche casi todo sale "Cerrado"; para revisar la interfaz con lugares abiertos, trabaja de día.
- **Base compartida:** las sesiones y los reportes que haga cualquier integrante se ven en el panel de todos.

### 3.3 Cuando la afluencia se vence

La carga cubre 14 días desde el día en que se corrió. Si `http://localhost:8000/api/salud` dice `"afluencia_cubre_esta_hora": false`, cualquiera del equipo puede recargar `rumbo-dev` (tarda menos de un minuto y no duplica datos):

```bash
cd backend
uv run python ../herramientas/bd_desarrollo.py
```

Se niega a correr si tu `.env` dice `RUMBO_AMBIENTE=demo`, para no pisar la base de la demo.

### 3.4 Pruebas

```bash
cd backend
uv run pytest -q
```

Cada prueba crea un esquema temporal (`prueba_<hex>`) en la base de `DATABASE_URL_PRUEBAS` y lo borra al terminar, así dos integrantes pueden correrlas a la vez sin pisarse. Tardan unos 3 minutos por la red. Sin `DATABASE_URL_PRUEBAS`, las que usan base salen como `skipped`.

`tests/test_seguridad.py` comprueba que nadie pueda leer ni escribir las tablas con la clave pública de Supabase. Solo corre si `backend/.env` tiene `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` (Supabase → **Project settings** → **API Keys**).

## 4. Modo con datos reales

Para la computadora que **sí tiene** `backend/.env` y `backend/data/raw/`: la de la demo, la presentación y las pruebas con usuarios.

> `backend/.env` y `backend/data/raw/` **nunca** se suben a git ni se pegan en un chat. El `.gitignore` ya los excluye.

### 4.1 Lo que `git clone` no trae

| Qué | A dónde | Para qué |
|---|---|---|
| `.env` | `backend/.env` | URL de `rumbo-demo` (`DATABASE_URL`), `RUMBO_AMBIENTE=demo` y las claves de OpenRouteService (`ORS_API_KEY`) y TomTom (`TOMTOM_API_KEY`) |
| Archivos oficiales | `backend/data/raw/` (41 MB, 10 archivos) | Observatorio, INAH, DENUE y las matrices de traslados ya consultadas a ORS |

Se copian a mano (USB o OneDrive) desde la computadora que ya los tiene. Lo demás se genera: los datos de `rumbo-demo` y `backend/data/chroma/` con el pipeline (4.4) y `frontend/dist/` con `npm run build` (4.5).

> **Atajo, si no hay tiempo:** si `rumbo-demo` ya está cargada, basta copiar `backend/data/chroma/` (33 MB) y saltarse el paso 4.4. Los datos ya están en la nube.

> **Antes de cada presentación:** el plan Free de Supabase pausa un proyecto que lleva unos 7 días sin uso. El día anterior, entra a Supabase y revisa que `rumbo-demo` esté activo; si dice *Paused*, presiona **Restore** (tarda unos minutos). Ten a la mano un hotspot: sin internet no hay app.

### 4.2 Modelos de Ollama

Sin configurar nada, el backend usa **`qwen3:8b`**. En una laptop con poca memoria de video conviene **`qwen3:4b`**. Los embeddings son **`bge-m3`** en los dos casos:

```bash
ollama pull qwen3:4b      # o qwen3:8b si la laptop aguanta
ollama pull bge-m3
ollama list
```

Si usas `qwen3:4b`, define `OLLAMA_MODELO` (sin editar el `.env`):

**Windows:**

```powershell
# La primera línea es para las terminales nuevas, la segunda para la actual
[Environment]::SetEnvironmentVariable('OLLAMA_MODELO', 'qwen3:4b', 'User')
$env:OLLAMA_MODELO = 'qwen3:4b'
```

**Linux (Ubuntu):**

```bash
# Cambia ~/.bashrc por ~/.zshrc si usas zsh
echo "export OLLAMA_MODELO=qwen3:4b" >> ~/.bashrc
export OLLAMA_MODELO=qwen3:4b
```

Si la variable apunta a un modelo que Ollama no tiene, el chat responde **503**. La terminal del backend lo dice: `Ollama no tiene el modelo 'X'`.

### 4.3 Zona horaria

El semáforo en vivo usa la hora local, así que la computadora tiene que estar en la hora de Puebla:

**Windows:**

```powershell
Get-TimeZone      # (UTC-06:00) Guadalajara, Ciudad de México, Monterrey
```

**Linux (Ubuntu):**

```bash
timedatectl       # Time zone: America/Mexico_City
```

### 4.4 Base real e índice del asistente

Este paso necesita internet (TomTom y Open-Meteo) y Ollama abierto:

```bash
cd backend
uv run python -m scripts.pipeline data/raw
```

- El argumento `data/raw` hace que el paso 1 tome los archivos que ya copiaste.
- Los traslados salen de los `ors_matriz_*.json` sin volver a consultar ORS.
- Escribe en la base de `DATABASE_URL` del `.env`: revisa que sea `rumbo-demo` antes de correrlo.
- El paso 8 (`validar_bd`) debe terminar sin fallas e imprime las filas de cada tabla, y el paso 9 indexa ChromaDB. Sin Ollama, el paso 9 se salta con un aviso y el resto de la app funciona.
- El pipeline reescribe la fecha en `backend/data/manifiesto_raw.csv`. Ese cambio no se commitea: `git checkout -- data/manifiesto_raw.csv`.
- La afluencia estimada cubre los próximos días. Antes de una demo o de una sesión de pruebas, vuelve a correr el pipeline si la base tiene más de una semana.

### 4.5 Compilar y verificar

```bash
cd frontend && npm run build && cd ..   # crea frontend/dist/, que FastAPI sirve en el puerto 8000
cd backend
uv run pytest -q                        # 115 pruebas; las de base usan DATABASE_URL_PRUEBAS (3.4)
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

En el navegador:

1. `http://127.0.0.1:8000/api/salud`: en `claves`, `ORS_API_KEY` y `TOMTOM_API_KEY` deben salir en `true`. En `ollama`, `disponible: true` y el `modelo` que elegiste. En `chroma`, que el índice exista.
2. `http://127.0.0.1:8000`: elige un interés y entra. Revisa la lista, la vista con todos los lugares, una ficha, las formas del semáforo y el botón **Aa** (tamaño de letra, colores para daltonismo e idioma). Prueba el asistente con las preguntas sugeridas. Entra también a `/panel`.

Para trabajar en la interfaz con recarga en vivo y los datos reales, deja el backend corriendo y en otra terminal usa `npm run dev` (paso 3, terminal 2).

## 5. Pruebas con usuarios en celulares

Para que otras personas usen la app desde su celular, todos tienen que estar en la misma red que la computadora. Se usa el **modo con datos reales**.

**Windows**

1. Activa la **zona con cobertura inalámbrica móvil**. Así los celulares también tienen internet, que hace falta para el mapa, el clima y el tráfico.
2. Busca la IP de la computadora en ese adaptador con `ipconfig` (suele ser `192.168.137.1`).
3. Abre el puerto 8000. Necesita PowerShell **como administrador**:
   ```powershell
   New-NetFirewallRule -DisplayName "RUMBO 8000" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow -Profile Any
   ```

**Linux**

1. Comparte la red desde *Configuración → Wi-Fi → Activar punto de acceso*, o conecta la computadora y los celulares a la misma red.
2. Busca la IP con `ip -4 addr` o `hostname -I`.
3. Si el firewall está activo (`sudo ufw status`), abre el puerto: `sudo ufw allow 8000/tcp`.

**En los dos sistemas**, arranca el servidor en modo demo. `PUEBLA_DEMO=1` marca las sesiones como de prueba (RN_11), y así no se mezclan con datos reales:

```powershell
cd backend
$env:PUEBLA_DEMO = '1'
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

```bash
cd backend
PUEBLA_DEMO=1 uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Prueba desde un celular: `http://<IP>:8000`.

## Problemas conocidos

| Síntoma | Causa | Qué hacer |
|---|---|---|
| `address already in use` al arrancar el backend, o Vite abre en el puerto 5174 | Otro servidor ya usa el 8000 o el 5173 (por ejemplo, el del hackathon) | Ciérralo con Ctrl+C en su terminal. En Linux, `ss -ltnp \| grep -E ':8000\|:5173'` dice qué proceso es |
| Todo sale "Cerrado" | Es de noche: el semáforo usa la hora real | Es esperado; prueba de día |
| En el modo de desarrollo, los lugares abiertos salen como "Sin dato" | La afluencia de `rumbo-dev` se venció | Recarga la base (paso 3.3) |
| El backend no arranca: `Falta DATABASE_URL` o `DATABASE_URL apunta a SQLite` | No hay `backend/.env` o tiene la URL vieja de SQLite | Llénalo como en el paso 3.1 |
| Todo responde 503 y la terminal dice `Base de datos no disponible` | Sin internet, contraseña equivocada en `DATABASE_URL` o el proyecto de Supabase está pausado | Revisa la conexión y la URL; en Supabase, **Restore** si está pausado. Al volver la base, la app responde sola, sin reiniciar |
| El chat responde 503 | `OLLAMA_MODELO` apunta a un modelo que no está, u Ollama está cerrado | Lee la línea `WARNING: Asistente no disponible (503): …` en la terminal del backend |
| La primera pregunta tarda mucho | Ollama está cargando el modelo | Espera a que `/api/salud` diga que el modelo está cargado antes de empezar |
| Todo se vuelve lento | Dos procesos usan Ollama a la vez (por ejemplo, el servidor y `scripts.evaluar_rag`) | Corre solo uno a la vez y cierra otras apps que usen la GPU |
| `/api/salud` dice `false` en una clave | El `.env` no está en `backend/` o le falta la clave | Revisa que el archivo se llame exactamente `.env`; en Windows el explorador puede ocultar que quedó como `.env.txt` |
| "Centrar en mi ubicación" no funciona en el celular | Por `http://IP` el navegador no da la ubicación (no es HTTPS) | Es esperado: la app avisa y usa el lugar que se eligió en "Estoy en…" |
| De noche, "¿y si llueve?" da un texto fijo | No hay lugares techados abiertos y el backend no deja que el modelo invente | Es a propósito; de día responde el modelo |
