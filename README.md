# ✅ Task Manager — Full Stack

Gestor de tareas personal con autenticación de usuarios, base de datos real y soporte offline (PWA).

## Stack

| Parte | Tecnología |
|---|---|
| Frontend | Vanilla JS, HTML, CSS |
| Backend | Node.js + Express |
| Base de datos | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) |
| PWA | Service Worker + Web App Manifest |

## Funcionalidades

- Registro e inicio de sesión con JWT
- Cada usuario ve solo sus propias tareas
- Crear, editar inline, completar y eliminar tareas
- Papelera con restauración individual o total
- Tareas sincronizadas entre dispositivos
- Funciona offline (PWA)
- Instalable en celular como app

## Estructura del proyecto

```
task-manager/
├── backend/
│   ├── server.js           → Servidor Express
│   ├── models/
│   │   ├── User.js         → Modelo de usuario
│   │   └── Task.js         → Modelo de tarea
│   ├── routes/
│   │   ├── auth.js         → Register / Login
│   │   └── tasks.js        → CRUD de tareas
│   ├── middleware/
│   │   └── auth.js         → Verificación JWT
│   ├── .env.example        → Variables de entorno
│   └── package.json
└── frontend/
    ├── index.html          → App principal
    ├── trash.html          → Papelera
    ├── main.js             → Lógica + auth
    ├── trash.js            → Lógica papelera
    ├── style.css           → Estilos
    ├── auth.css            → Estilos de auth (agregar al style.css)
    ├── manifest.json       → PWA manifest
    └── sw.js               → Service Worker
```

## Cómo correrlo localmente

### 1. Clonar el repo
```bash
git clone https://github.com/Celinadigital25/task-manager.git
cd task-manager
```

### 2. Instalar dependencias del backend
```bash
cd backend
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```
Editá el `.env` con tu URI de MongoDB y una clave secreta para JWT.

### 4. Iniciar el servidor
```bash
npm run dev
```

### 5. Abrir en el navegador
```
http://localhost:3000
```

## API Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | /api/auth/register | Crear cuenta |
| POST | /api/auth/login | Iniciar sesión |
| GET | /api/tasks | Obtener tareas activas |
| POST | /api/tasks | Crear tarea |
| PATCH | /api/tasks/:id | Editar tarea |
| PATCH | /api/tasks/:id/trash | Mover a papelera |
| PATCH | /api/tasks/:id/restore | Restaurar de papelera |
| DELETE | /api/tasks/:id | Eliminar permanentemente |
| GET | /api/tasks/trash | Ver papelera |
| PATCH | /api/tasks/trash/restore-all | Restaurar toda la papelera |
| DELETE | /api/tasks/trash/all | Vaciar papelera |

*Proyecto académico — Desarrollo Web Full Stack*
