<div align="center">

# 🏋️ ONE LIFE ONE BODY

### Fitness Center — Aplicación Web Fullstack

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)]()

---

**Aplicación web completa para la gestión de un centro de fitness y entrenamiento personal.**

Seguimiento de composición corporal · Planes de alimentación · Reservas de pesaje · Chatbot IA · Panel de administración

[Demo](#) · [Documentación](#-estructura-del-proyecto) · [Instalación](#-instalación)

---

</div>

## 📋 Tabla de contenidos

- [Sobre el proyecto](#-sobre-el-proyecto)
- [Tecnologías](#-tecnologías)
- [Funcionalidades](#-funcionalidades)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Instalación](#-instalación)
- [Variables de entorno](#-variables-de-entorno)
- [API Endpoints](#-api-endpoints)
- [Base de datos](#-base-de-datos)
- [Seguridad](#-seguridad)
- [Capturas de pantalla](#-capturas-de-pantalla)
- [Autor](#-autor)

---

## 🎯 Sobre el proyecto

**One Life One Body** es una aplicación web fullstack desarrollada como proyecto final del ciclo formativo de **Desarrollo de Aplicaciones Web (DAW)** durante el curso 2025/2026.

La aplicación digitaliza la gestión de un centro de fitness real ubicado en **Benidorm, Alicante**, permitiendo a los entrenadores gestionar pesajes, dietas y citas, y a los clientes consultar su evolución física desde cualquier dispositivo.

### El problema

Toda la gestión del centro se realizaba de forma manual: pesajes en papel, dietas por WhatsApp, citas por llamada. Esto generaba ineficiencias y una experiencia poco profesional.

### La solución

Una plataforma web centralizada con roles diferenciados (admin/cliente), seguimiento en tiempo real, generación de informes PDF, notificaciones automáticas por email y un chatbot con IA para atención al cliente.

---

## 🛠 Tecnologías

### Backend
| Tecnología | Uso |
|---|---|
| **PHP 8.2** | Lenguaje del servidor |
| **Laravel 11** | Framework MVC / API REST |
| **Laravel Sanctum** | Autenticación por tokens Bearer |
| **MySQL 8** | Base de datos relacional |
| **Eloquent ORM** | Mapeo objeto-relacional con Eager Loading |
| **DomPDF** | Generación de informes PDF |
| **Gmail SMTP** | Envío de emails transaccionales |

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
| **SASS/SCSS** | Preprocesador CSS |

### Servicios externos
| Servicio | Uso |
|---|---|
| **Google Gemini 2.5 Flash** | Chatbot IA con contexto del negocio |
| **BioTech USA** | Integración de productos con código de descuento |

---

## ✨ Funcionalidades

### 🌐 Zona pública
- **Landing page** con animación 3D (Three.js), secciones de método, servicios y contacto
- **Página de Entrenamiento Online** con video hero, features, productos BioTech USA
- **Chatbot IA** flotante conectado a Google Gemini con system prompt personalizado
- **Contacto por WhatsApp** directo con los entrenadores
- **Código de acceso** para proteger el área de clientes

### 👤 Panel de usuario
- **Dashboard** personalizado con saludo, frase motivadora diaria, estadísticas de peso, mini gráfica SVG de evolución y quick links
- **Seguimiento de peso** con gráfica interactiva, % grasa, % músculo e historial completo (solo lectura)
- **Mi Dieta** — visualización de plan de alimentación estructurado (desayuno, comida, merienda, cena, pre/post entreno)
- **Reservas de pesaje** — calendario mensual navegable con horarios disponibles y notificación automática al entrenador
- **Perfil** — gestión de datos personales y cambio de contraseña con verificación por email

### 🔧 Panel de administración
- **Usuarios & Pesajes** — gestión completa de pesajes de todos los clientes con % grasa, % músculo, edición inline y exportación a PDF profesional
- **Dietas** — creación de planes de alimentación estructurados, asignación a usuarios, activar/desactivar planes
- **Servicios** — CRUD de servicios ofertados por el centro
- **Informes PDF** — generación de informes con diseño OLOB, estadísticas, gráfica de evolución y tabla completa
- **Emails automáticos** — recordatorio semanal de pesaje (Job programado cada lunes 9:00)

### 🔐 Autenticación y seguridad
- Login / Registro con validación estricta (regex para email, teléfono español 9 dígitos, nombre único)
- Recuperación de contraseña por código de email (6 dígitos, expira en 10 min)
- Tokens Bearer con Sanctum (expiración 7 días)
- Rate limiting por endpoint (auth: 5/15min, admin: 60/15min, chatbot: 20/hora)
- Headers de seguridad (CSP, HSTS, X-Frame-Options, XSS-Protection)
- Logging de seguridad separado (401, 403, 422, 429)

---

## 📁 Estructura del proyecto

```
One_Life_One_Body/
│
├── Frontend/                    # React 19 + TypeScript + Vite
│   ├── public/                  # Assets estáticos (videos, imágenes)
│   └── src/
│       ├── pages/               # Páginas de la aplicación
│       │   ├── Home/            # Landing page
│       │   ├── OnlineTraining/  # Entrenos online
│       │   ├── Auth/            # Login, Register, ForgotPassword, AccessGate
│       │   ├── Dashboard/       # Dashboard del usuario
│       │   └── admin/           # Páginas de administración
│       ├── user/                # Páginas del usuario (Tracking, Diet, Appointments, Profile)
│       ├── components/          # Guards, PublicLayout, AccessGuard
│       ├── layouts/             # UserLayout (sidebar con estrellas)
│       ├── context/             # AuthContext (estado global)
│       ├── services/            # api.ts (Axios), auth.ts
│       └── styles/              # theme.scss (SASS)
│
├── Backend/                     # Laravel 11
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/     # 12 controllers
│   │   │   └── Middleware/      # SecurityHeaders, LogSecurity, IsAdmin, ValidateEnv
│   │   ├── Models/              # User, WeightRecord, DietPlan, DietMeal, WeighingAppointment
│   │   ├── Mail/                # VerificationCode, WeeklyReminder, AppointmentNotification
│   │   ├── Jobs/                # WeeklyReminderJob
│   │   └── Console/             # Kernel (Schedule)
│   ├── database/migrations/     # 8 migraciones
│   ├── resources/views/
│   │   ├── emails/              # Templates de email (Blade)
│   │   └── pdf/                 # Template del informe PDF
│   └── routes/api.php           # 40+ endpoints REST
│
└── README.md
```

---

## 🚀 Instalación

### Requisitos previos
- PHP 8.2+
- Composer 2.x
- Node.js 18+
- MySQL 8.0+
- XAMPP (o servidor Apache equivalente)

### Backend

```bash
cd Backend

# Instalar dependencias
composer install

# Copiar variables de entorno
cp .env.example .env

# Generar key de la aplicación
php artisan key:generate

# Configurar base de datos en .env (ver sección Variables de entorno)

# Ejecutar migraciones
php artisan migrate

# Instalar paquete de PDFs
composer require barryvdh/laravel-dompdf

# Limpiar caché
php artisan config:clear
php artisan cache:clear
```

### Frontend

```bash
cd Frontend

# Instalar dependencias
npm install

# Instalar SASS
npm install sass --save-dev

# Iniciar servidor de desarrollo
npm run dev
```

### Build de producción

```bash
cd Frontend
npm run build
# Los archivos estáticos se generan en dist/
```

---

## 🔑 Variables de entorno

Crear archivo `Backend/.env` con:

```env
APP_NAME="One Life One Body"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=one_life_one_body
DB_USERNAME=root
DB_PASSWORD=

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=tu-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=tu-email@gmail.com
MAIL_FROM_NAME="One Life One Body"

GEMINI_API_KEY=tu-api-key-de-google
```

---

## 📡 API Endpoints

### Autenticación
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/register` | Registro de usuario |
| `POST` | `/login` | Inicio de sesión |
| `POST` | `/logout` | Cerrar sesión |
| `GET` | `/me` | Datos del usuario actual |

### Usuario
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/weight-records` | Mis pesajes |
| `GET` | `/weight-records/stats` | Mis estadísticas |
| `GET` | `/my-diet` | Mi dieta activa |
| `GET` | `/my-appointments` | Mis reservas |
| `POST` | `/appointments/book` | Reservar pesaje |
| `PATCH` | `/appointments/{id}/cancel` | Cancelar reserva |

### Administración
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/admin/users` | Listar clientes |
| `POST` | `/admin/users/{id}/weight-records` | Crear pesaje |
| `PUT` | `/admin/weight-records/{id}` | Editar pesaje |
| `DELETE` | `/admin/weight-records/{id}` | Eliminar pesaje |
| `GET` | `/admin/users/{id}/.../pdf` | Exportar PDF |
| `POST` | `/admin/diet/users/{id}` | Crear dieta |
| `PUT` | `/admin/diet/plans/{id}` | Editar dieta |
| `GET` | `/admin/appointments` | Ver todas las citas |

### Público
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/chatbot` | Chat IA (Gemini) |
| `POST` | `/forgot-password/request-code` | Solicitar código reset |
| `POST` | `/forgot-password/reset` | Cambiar contraseña |

---

## 🗄 Base de datos

### Modelo relacional

```
users ──────────── weight_records
  │                (peso, grasa, músculo, fecha)
  │
  ├──────────── diet_plans ──── diet_meals
  │              (título, notas)  (tipo, alimentos, kcal, macros)
  │
  ├──────────── weighing_appointments
  │              (fecha, hora, estado)
  │
  └──────────── personal_access_tokens
                 (tokens Sanctum)

services          (título, descripción, orden)
```

### Relaciones
- `User` hasMany → `WeightRecord`, `DietPlan`, `WeighingAppointment`
- `DietPlan` hasMany → `DietMeal`
- Eager Loading en consultas de administración para evitar N+1

---

## 🛡 Seguridad

| Medida | Implementación |
|---|---|
| **Rate Limiting** | Auth 5/15min, Admin 60/15min, API 100/min, Chatbot 20/hora |
| **Headers HTTP** | X-Content-Type-Options, X-Frame-Options, HSTS, XSS-Protection, Referrer-Policy, Permissions-Policy |
| **Validación** | `$request->validate()` en todos los endpoints + regex en frontend |
| **SQL Injection** | Imposible — Eloquent ORM usa queries parametrizadas |
| **XSS** | React escapa HTML por defecto |
| **Autenticación** | Tokens Bearer (Sanctum), bcrypt para contraseñas |
| **Logging** | Canal separado `security.log` — registra 401, 403, 422, 429 |
| **Env Validation** | Middleware que verifica variables de entorno en producción |

---

## 📸 Capturas de pantalla

> *Las capturas de pantalla se añadirán cuando el proyecto esté desplegado.*

| Vista | Descripción |
|---|---|
| Landing | Página principal con 3D y animaciones |
| Entrenos Online | Video hero + productos BioTech |
| Dashboard | Panel del usuario con estadísticas |
| Seguimiento | Gráfica de evolución de peso |
| Admin Pesajes | Gestión de pesajes con PDF |
| Admin Dietas | Planes de alimentación |
| Reservas | Calendario de citas |

---

## 👨‍💻 Autor

**David Montero Blanco**

- 📍 Benidorm, Alicante
- 🎓 DAW — Desarrollo de Aplicaciones Web (2025/2026)
- 📸 [@one.life.one.body.benidorm](https://www.instagram.com/one.life.one.body.benidorm/)

---

<div align="center">

**One Life One Body** © 2026 · Todos los derechos reservados

*Proyecto final de DAW — Desarrollado con ❤️ en Benidorm*

</div>