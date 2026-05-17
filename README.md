# CX Research App

Plataforma tipo SurveySensum para crear, distribuir y analizar surveys de NPS, CSAT y CES, con sentiment analysis automático y pipeline de closing the loop. Industry-agnostic (telco, fintech, retail, SaaS, salud, hospitality, etc.).

**Stack:** Next.js 14 (App Router) · TypeScript · TailwindCSS · Supabase (Auth + Postgres) · Recharts.

## Funcionalidades

- Auth con email/contraseña (Supabase)
- Crear surveys NPS/CSAT/CES con preguntas configurables
- Link público por survey (`/s/[shareId]`) para que respondan sin loguearse
- Dashboard con score, evolución, distribución, segmentos, sentiment, temas y quotes
- Pipeline editable de closing the loop con priorización automática y dueño sugerido
- Tabla de respuestas crudas
- Multi-usuario con Row Level Security en Supabase

---

## Deploy paso a paso (≈ 15 minutos)

### 1) Crear cuenta de Supabase y proyecto

1. Andá a https://supabase.com y creá una cuenta gratuita (con GitHub o email).
2. Click en "New project".
3. Elegí un nombre (ej: `cx-research`), una contraseña fuerte para la DB (guardala), y la región más cercana (`East US (N. Virginia)` anda bien para LATAM).
4. Esperá 1-2 minutos a que se inicialice.

### 2) Correr el schema SQL

1. En el dashboard de Supabase, andá a **SQL Editor** (icono de base de datos en el sidebar).
2. Click en "New query".
3. Pegá todo el contenido del archivo `supabase-schema.sql` que viene en este proyecto.
4. Click en "Run". Tiene que decir "Success".

### 3) Obtener las credenciales

1. En Supabase, andá a **Project Settings → API** (icono de engranaje).
2. Copiá estos dos valores:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon public** key (la primera key pública, NO la `service_role`)

### 4) Configurar autenticación

1. En Supabase, andá a **Authentication → Providers → Email**.
2. Asegurate que esté habilitado. Para desarrollo es OK que deje activado "Confirm email" (Supabase manda un mail de confirmación). Para producción podés desactivarlo si querés permitir alta inmediata.

### 5) Crear cuenta en Vercel y deploy

#### Opción A — Deploy desde GitHub (recomendado, automatiza redeploys)

1. Subí este proyecto a un repo de GitHub:
   ```bash
   cd cx-research-app
   git init
   git add .
   git commit -m "Initial commit"
   gh repo create cx-research-app --private --source=. --push
   ```
   (Si no tenés `gh` instalado, creá el repo en github.com manualmente y `git remote add origin ...` + `git push`.)

2. Andá a https://vercel.com y creá cuenta (sign in con GitHub).
3. Click en "Add New → Project".
4. Importá el repo `cx-research-app`.
5. En "Environment Variables" agregá las 3 variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = (el Project URL que copiaste)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (la anon key que copiaste)
   - `NEXT_PUBLIC_APP_URL` = (déjala vacía por ahora, después la actualizamos)
6. Click en "Deploy".
7. Esperá 1-2 minutos. Cuando termina te da una URL tipo `cx-research-app.vercel.app`.
8. Andá de nuevo a las env vars y actualizá `NEXT_PUBLIC_APP_URL` con esa URL (ej: `https://cx-research-app.vercel.app`).
9. Redeploy desde Vercel (Deployments → ... → Redeploy).

#### Opción B — Deploy con Vercel CLI (sin GitHub)

1. Instalá Vercel CLI: `npm i -g vercel`
2. Desde la carpeta del proyecto: `vercel`
3. Seguí los prompts (loggeá con tu cuenta, elegí nombre del proyecto).
4. Cuando termine, andá al dashboard de Vercel y agregá las env vars como en la Opción A.

### 6) Configurar redirect URL en Supabase

1. En Supabase, andá a **Authentication → URL Configuration**.
2. En "Site URL" poné: `https://tu-app.vercel.app`
3. En "Redirect URLs" agregá: `https://tu-app.vercel.app/**`
4. Save.

### 7) Listo

Andá a `https://tu-app.vercel.app`, creá una cuenta, y armá tu primer survey. Cuando lo crees, vas a poder copiar el link público y mandárselo a tus clientes.

---

## Correr local

```bash
cd cx-research-app
npm install
cp .env.local.example .env.local
# Editá .env.local con tu URL y anon key de Supabase
npm run dev
```

Abrí http://localhost:3000

---

## Estructura del proyecto

```
src/
├── app/
│   ├── page.tsx                          → Landing
│   ├── login/, signup/, logout/          → Auth
│   ├── dashboard/                        → Lista de surveys
│   ├── surveys/
│   │   ├── new/                          → Builder
│   │   └── [id]/
│   │       ├── page.tsx                  → Dashboard del survey
│   │       ├── loop/                     → Closing the loop
│   │       └── responses/                → Tabla de respuestas
│   └── s/[shareId]/                      → Form público (sin auth)
├── components/
│   ├── DashboardView.tsx                 → Charts + KPIs
│   ├── SurveyBuilder.tsx                 → Form de creación
│   ├── PublicSurveyForm.tsx              → Form para respondentes
│   ├── LoopTable.tsx                     → Tabla editable de closing the loop
│   └── Header.tsx
├── lib/
│   ├── supabase/                         → Clients (server, client, middleware)
│   ├── sentiment.ts                      → Taxonomía + categorización
│   ├── metrics.ts                        → NPS/CSAT/CES + priorización
│   ├── benchmarks.ts                     → Badges contextuales
│   └── types.ts
└── middleware.ts                         → Auth protection
supabase-schema.sql                       → Schema + RLS policies
```

---

## Cómo extender

- **Más temas en sentiment:** editá `src/lib/sentiment.ts` → `TAXONOMY` agregando o quitando categorías y keywords.
- **Más industrias en benchmarks:** editá `src/lib/benchmarks.ts` para devolver badges según vertical específico.
- **Cambiar plantillas de preguntas:** editá `DEFAULT_QUESTIONS` en `src/components/SurveyBuilder.tsx`.
- **Login con Google:** en Supabase, activá el provider en Authentication → Providers → Google, y agregá un botón con `supabase.auth.signInWithOAuth({ provider: 'google' })`.

---

## Costos

- **Vercel (free tier):** ilimitado para proyectos personales/hobby. 100 GB de bandwidth/mes.
- **Supabase (free tier):** 500 MB de DB, 50.000 monthly active users, 5 GB de bandwidth. Suficiente para cientos de surveys con miles de respuestas.

Para uso de consultoría con varios clientes, el free tier alcanza.
