<div align="center">

# ONE LIFE ONE BODY

### Fitness Center — Aplicación Web Fullstack

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://www.sqlite.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)]()

---

**Aplicación web completa para la gestión de un centro de fitness y entrenamiento personal.**

Seguimiento corporal · Planes de alimentación · Reservas de pesaje · Chatbot IA · Biblioteca de ejercicios · Panel de administración

</div>

---

## Tabla de contenidos

- [Sobre el proyecto](#sobre-el-proyecto)
- [Tecnologías](#tecnologías)
- [Funcionalidades](#funcionalidades)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [API Endpoints](#api-endpoints)
- [Base de datos](#base-de-datos)
- [Seguridad](#seguridad)
- [Autor](#autor)

---

## Sobre el proyecto

**One Life One Body** es una aplicación web fullstack desarrollada como proyecto final del ciclo formativo de **Desarrollo de Aplicaciones Web (DAW)** durante el curso 2025/2026.

La aplicación digitaliza la gestión de un centro de fitness real ubicado en **Benidorm, Alicante**, permitiendo a los entrenadores gestionar pesajes, dietas y citas, y a los clientes consultar su evolución física desde cualquier dispositivo.

### El problema

Toda la gestión del centro se realizaba de forma manual: pesajes en papel, dietas por WhatsApp, citas por llamada. Esto generaba ineficiencias y una experiencia poco profesional.

### La solución

Una plataforma web centralizada con roles diferenciados (admin/cliente), seguimiento en tiempo real, generación de informes PDF, notificaciones automáticas por email, chatbot con IA y una biblioteca interactiva de ejercicios con demostraciones en vídeo.

---

## Tecnologías

### Backend
| Tecnología | Uso |
|---|---|
| **PHP 8.2** | Lenguaje del servidor |
| **Laravel 11** | Framework MVC / API REST |
| **Laravel Sanctum** | Autenticación por tokens Bearer |
| **SQLite 3** | Base de datos |
| **Eloquent ORM** | Mapeo objeto-relacional |
| **DomPDF** | Generación de informes PDF |
| **Gmail SMTP** | Envío de emails transaccionales |
| **Laravel Cache** | Caché de respuestas de APIs externas |

### Frontend
| Tecnología | Uso |
|---|---|
| **React 19** | Librería UI (SPA) |
| **TypeScript 5** | Tipado estático |
| **Vite 6** | Build tool y dev server |
| **React Router 7** | Enrutamiento SPA |
| **Framer Motion** | Animaciones y transiciones |
| **Three.js / R3F** | Gráficos 3D en landing |
| **Axios** | Cliente HTTP |

### Servicios externos
| Servicio | Uso |
|---|---|
| **Google Gemini 2.5 Flash** | Chatbot IA con contexto del negocio |
| **wger REST API** | Biblioteca de ejercicios (800+ ejercicios) |
| **YouTube Data API v3** | Vídeos de demostración para ejercicios |
| **Wikipedia API** | Imágenes de respaldo para ejercicios |
| **Google Maps Embed** | Mapa de localización del centro |

---

## Funcionalidades

### Zona pública
- **Landing page** con animación 3D (Three.js), secciones de método, servicios, testimonios y contacto
- **Mapa interactivo** de Google Maps con la localización exacta del centro (C/ de Goya, 37, Benidorm)
- **Página de Entrenamiento Online** con vídeo hero y características del servicio
- **Chatbot IA** flotante conectado a Google Gemini con system prompt personalizado del negocio
- **Código de acceso** para proteger el área de clientes

### Panel de usuario
- **Dashboard** personalizado con estadísticas de peso, mini gráfica SVG de evolución y accesos rápidos
- **Seguimiento de peso** con gráfica interactiva, % grasa, % músculo e historial completo
- **Mi Dieta** — visualización del plan de alimentación (desayuno, comida, merienda, cena, pre/post entreno)
- **Reservas de pesaje** — calendario mensual con horarios disponibles y notificación automática por email
- **Perfil** — gestión de datos personales y cambio de contraseña con verificación por email
- **Biblioteca de ejercicios** — más de 800 ejercicios con nombres en español, filtrado por categoría muscular y búsqueda

### Biblioteca de ejercicios
- Filtrado por grupo muscular: Pecho, Espalda, Hombros, Brazos, Piernas, Abdomen, Gemelos
- Animaciones de demostración con 2 fotogramas (posición inicial/final) desde wger
- Vídeos de YouTube en mudo y en bucle para ejercicios sin imágenes propias
- Sistema de favoritos guardados en base de datos del usuario
- Modal de detalle con músculos trabajados, equipamiento necesario y descripción
- Nombres, músculos, categorías y equipamiento completamente en español
- Caché agresiva: wger 10 min · imágenes 24h · YouTube 30 días

### Panel de administración
- **Usuarios & Pesajes** — gestión completa de pesajes con edición inline y exportación a PDF
- **Dietas** — creación y asignación de planes de alimentación estructurados
- **Servicios** — CRUD de servicios ofertados por el centro
- **Informes PDF** — generación con diseño corporativo, estadísticas y gráfica de evolución
- **Emails automáticos** — recordatorio semanal de pesaje programado cada lunes a las 9:00

### Autenticación y seguridad
- Login / Registro con validación (regex email, teléfono español 9 dígitos)
- Recuperación de contraseña por código de 6 dígitos enviado al email (expira en 10 min)
- Tokens Bearer con Sanctum (expiración 7 días)
- Rate limiting por endpoint (auth: 5/15min, admin: 60/15min, chatbot: 20/hora)
- Headers de seguridad (CSP, HSTS, X-Frame-Options, XSS-Protection)

---

## Estructura del proyecto

```
Proyecto-One-Life-One-Body/
│
├── Frontend/                    # React 19 + TypeScript + Vite
│   ├── public/                  # Assets estáticos (vídeos, imágenes)
│   └── src/
│       ├── pages/
│       │   ├── Home/            # Landing page + mapa
│       │   ├── OnlineTraining/  # Página de entrenos online
│       │   ├── ExerciseLibrary/ # Biblioteca de ejercicios (wger + YouTube)
│       │   ├── Auth/            # Login, Register, ForgotPassword, AccessGate
│       │   ├── Dashboard/       # Dashboard del usuario
│       │   ├── Legal/           # Aviso legal, Privacidad, Cookies
│       │   └── admin/           # Páginas de administración
│       ├── user/                # Tracking, Diet, Appointments, Profile
│       ├── components/          # Guards, PublicLayout, AccessGuard
│       ├── layouts/             # UserLayout (sidebar animado)
│       ├── context/             # AuthContext
│       ├── services/            # api.ts (Axios configurado)
│       └── types.ts             # Tipos TypeScript globales
│
└── Backend/                     # Laravel 11
    ├── app/
    │   ├── Http/
    │   │   ├── Controllers/     # 13 controllers (incluye ExternalWgerController)
    │   │   └── Middleware/      # SecurityHeaders, LogSecurity, IsAdmin, ValidateEnv
    │   ├── Models/              # User, WeightRecord, DietPlan, DietMeal, WeighingAppointment, SavedExercise
    │   ├── Mail/                # VerificationCode, WeeklyReminder, AppointmentNotification
    │   └── Jobs/                # WeeklyReminderJob
    ├── database/migrations/     # 9 migraciones
    ├── resources/views/
    │   ├── emails/              # Templates de email (Blade)
    │   └── pdf/                 # Template del informe PDF
    └── routes/api.php           # 40+ endpoints REST
```

---

## Instalación

### Requisitos previos
- PHP 8.2+
- Composer 2.x
- Node.js 18+

### Backend

```bash
cd Backend

# Instalar dependencias
composer install

# Copiar variables de entorno
cp .env.example .env

# Generar key de la aplicación
php artisan key:generate

# Ejecutar migraciones
php artisan migrate

# Limpiar caché
php artisan config:clear && php artisan cache:clear

# Iniciar servidor
php artisan serve
```

### Frontend

```bash
cd Frontend

# Instalar dependencias
npm install

# Crear archivo de entorno local
echo "VITE_API_URL=http://127.0.0.1:8000/api" > .env.local

# Iniciar servidor de desarrollo
npm run dev
```

### Build de producción

```bash
cd Frontend
npm run build
# Archivos generados en dist/ — subir al servidor web
```

---

## Variables de entorno

Crear `Backend/.env` basándose en `Backend/.env.example`:

```env
APP_NAME="One Life One Body"
APP_ENV=local
APP_KEY=                          # Generado con: php artisan key:generate
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=sqlite

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=tu-app-password-gmail
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=tu-email@gmail.com

GEMINI_API_KEY=                   # Obtener en: https://aistudio.google.com
YOUTUBE_API_KEY=                  # Google Cloud Console → habilitar YouTube Data API v3
```

> **El archivo `.env` está en `.gitignore` y nunca debe subirse al repositorio.**

---

## API Endpoints

### Autenticación (público)
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/register` | Registro de usuario |
| `POST` | `/api/login` | Inicio de sesión |
| `POST` | `/api/logout` | Cerrar sesión |
| `GET` | `/api/me` | Usuario autenticado |
| `POST` | `/api/forgot-password/request-code` | Solicitar código reset |
| `POST` | `/api/forgot-password/reset` | Restablecer contraseña |

### Usuario autenticado
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/weight-records` | Mis pesajes |
| `GET` | `/api/weight-records/stats` | Mis estadísticas |
| `GET` | `/api/my-diet` | Mi dieta activa |
| `GET/POST/PATCH` | `/api/my-appointments` | Reservas de pesaje |
| `GET/POST/DELETE` | `/api/saved-exercises` | Ejercicios favoritos |

### Administración
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/admin/users` | Listar clientes |
| `POST/PUT/DELETE` | `/api/admin/weight-records` | Gestión de pesajes |
| `GET` | `/api/admin/users/{id}/weight-records/pdf` | Exportar PDF |
| `POST/PUT/DELETE` | `/api/admin/diet/*` | Gestión de dietas |
| `GET/POST/PUT/DELETE` | `/api/admin/services` | Gestión de servicios |

### APIs externas (proxy con caché)
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/public/external/wger/exercises` | Listado de ejercicios |
| `GET` | `/api/public/external/wger/exerciseinfo/{id}` | Detalle + vídeo YouTube |
| `POST` | `/api/chatbot` | Chat con Gemini IA |

---

## Base de datos

```
users
  ├── weight_records       (peso, grasa %, músculo %, fecha)
  ├── diet_plans
  │     └── diet_meals     (tipo, alimentos, kcal, macros)
  ├── weighing_appointments (fecha, hora, estado)
  ├── saved_exercises      (source, external_id, name, description)
  └── personal_access_tokens

services                   (título, descripción, orden)
```

**Relaciones:**
- `User` hasMany → `WeightRecord`, `DietPlan`, `WeighingAppointment`, `SavedExercise`
- `DietPlan` hasMany → `DietMeal`

---

## Seguridad

| Medida | Implementación |
|---|---|
| **Rate Limiting** | Auth 5/15min · Admin 60/15min · Chatbot 20/hora |
| **Headers HTTP** | HSTS · X-Frame-Options · XSS-Protection · CSP · Referrer-Policy |
| **Validación** | `$request->validate()` en todos los endpoints |
| **SQL Injection** | Imposible — Eloquent ORM usa queries parametrizadas |
| **XSS** | React escapa HTML por defecto |
| **Autenticación** | Tokens Bearer (Sanctum) · bcrypt para contraseñas |
| **Logging** | Canal `security.log` — registra 401, 403, 422, 429 |
| **Credenciales** | Todas en `.env` (gitignored) · nunca en el código fuente |

---

## Autor

**David Montero Blanco**

- Benidorm, Alicante
- DAW — Desarrollo de Aplicaciones Web (2025/2026)
- Instagram: [@one.life.one.body.benidorm](https://www.instagram.com/one.life.one.body.benidorm/)

---

<div align="center">

**One Life One Body** © 2026 · Todos los derechos reservados

*Proyecto final de DAW — Desarrollado en Benidorm*

</div>
