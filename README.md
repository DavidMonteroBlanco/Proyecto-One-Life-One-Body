# 🏋️ One Life One Body – Plataforma de Gestión Deportiva

Aplicación web desarrollada como proyecto final del módulo DWEC.

Se trata de una plataforma interna para la gestión de entrenamientos, ejercicios, colaboradores y servicios, con autenticación, roles y consumo de API externa.

---

## 📌 Descripción del proyecto

**One Life One Body** es una aplicación SPA (Single Page Application) orientada a la gestión deportiva.

Permite a los usuarios:

- Consultar entrenamientos
- Buscar ejercicios desde una API externa
- Guardar favoritos
- Gestionar su perfil

Y a los administradores:

- Gestionar servicios
- Administrar colaboradores
- Configurar contenidos
- Controlar usuarios

Incluye backend con Laravel y frontend moderno con React.

---

## 🛠️ Tecnologías utilizadas

### Backend
- Laravel 12
- PHP 8
- MySQL / MariaDB
- Laravel Sanctum (autenticación)
- API REST
- Jobs y tareas programadas
- Validaciones

### Frontend
- Vite
- React
- TypeScript
- Tailwind CSS
- React Router
- Axios

### Otros
- Git / GitHub
- phpMyAdmin
- Thunder Client / Postman

---

## 📁 Estructura del proyecto

One_Life_One_Body/
│
├── Backend/ → API Laravel
├── Frontend/ → SPA React
├── Legacy-PHP/ → Web pública PHP
└── README.md


### Frontend



src/
├── components/
├── pages/
├── services/
├── types/
└── auth/


### Backend



app/
├── Models/
├── Controllers/
├── Middleware/
└── Jobs/

---

## 👤 Roles del sistema

La aplicación tiene dos tipos de usuarios:

### Usuario normal
- Ver entrenamientos
- Consultar ejercicios
- Guardar favoritos
- Acceso limitado

### Administrador
- CRUD de servicios
- CRUD de colaboradores
- Gestión del método
- Configuración
- Acceso completo

El acceso se controla mediante tokens y middleware.

---

## 🔐 Autenticación

La autenticación se realiza mediante:

- Laravel Sanctum
- Tokens JWT
- Almacenamiento en LocalStorage

Incluye:

- Login
- Logout
- Protección de rutas
- Control por roles

---

## 🌐 API Externa (wger)

Se consume la API pública **wger** para obtener ejercicios:

- Búsqueda
- Detalle
- Descripción
- Filtrado
- Guardado en BD

La API se consume desde el backend para evitar problemas de CORS.

---

## 📋 Funcionalidades principales

### Backend

- Autenticación por tokens
- Roles (admin / user)
- Validación de datos
- 4+ CRUD completos:
  - Workouts
  - Services
  - Collaborators
  - Saved Exercises
- Tareas programadas
- Jobs
- Cache de API externa
- Relaciones entre modelos

### Frontend

- SPA con React Router
- Tema claro / oscuro
- Consumo de API REST
- Formularios validados
- Filtros y ordenaciones
- Protección de rutas
- Guardado en localStorage
- Diseño responsive

---

## 📱 Diseño (UI/UX)

- Tailwind CSS
- Responsive (desktop / móvil)
- Tarjetas con glassmorphism
- Modo oscuro / claro
- Navegación desplegable
- Interfaz limpia

---

## 🚀 Instalación y ejecución

### Requisitos

- Node.js
- PHP 8+
- Composer
- MySQL
- XAMPP

---

### Backend

```bash
cd Backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve

Frontend

cd Frontend
npm install
npm run dev

http://localhost:5173

🧪 Usuario administrador de prueba

Email: dabuky@gmail.com
Password: Dabu23
Rol: admin