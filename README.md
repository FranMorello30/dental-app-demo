# 🦷 Dental App Demo

Sistema de gestión integral para clínicas dentales. Permite administrar pacientes, odontólogos, citas, historiales médicos, planes de tratamiento e inventario de equipos, con una interfaz moderna y comunicación en tiempo real.

---

## 📋 Descripción general

La aplicación es una plataforma full-stack diseñada para digitalizar y centralizar las operaciones de una clínica odontológica. Consta de un frontend en **Angular** y un backend en **NestJS** que expone una API REST con soporte de **WebSockets** para actualizaciones en tiempo real.

### Funcionalidades principales

| Módulo | Estado |
|--------|--------|
| Autenticación (login / JWT) | ✅ Completo |
| Gestión de pacientes (CRUD + perfil) | ✅ Completo |
| Odontograma interactivo | ✅ Completo |
| Historial médico con adjuntos | ✅ Completo |
| Planes de tratamiento | ✅ Completo |
| Gestión de odontólogos | ✅ Completo |
| Calendario de citas | ✅ Completo |
| Alertas médicas por paciente | ✅ Completo |
| Notificaciones en tiempo real (WebSocket) | ✅ Completo |
| Inventario de equipos | ⚠️ Vista preliminar (sin backend) |
| Configuraciones de la clínica | ⚠️ Parcial (especialidades guardadas, resto mock) |

---

## 🗂️ Estructura del repositorio

```
dental-app-demo/
├── app/                   # Frontend — Angular 18
│   └── src/app/
│       ├── core/          # Auth, navegación, iconos
│       ├── modules/
│       │   ├── auth/      # Login
│       │   └── admin/
│       │       └── pages/
│       │           ├── pacientes/       # Pacientes, perfil, odontograma
│       │           ├── odontologos/     # Odontólogos, horarios, registro
│       │           ├── calendario/      # Agenda y citas
│       │           ├── inventario/      # Inventario (vista preliminar)
│       │           └── configuraciones/ # Ajustes de la clínica
│       └── shared/        # Servicios, modelos, pipes compartidos
├── backend/               # Backend — NestJS 11
│   └── src/
│       ├── modules/
│       │   ├── auth/              # JWT + Passport
│       │   ├── patients/          # Pacientes
│       │   ├── odontologos/       # Odontólogos y horarios
│       │   ├── appointments/      # Citas
│       │   ├── medical_histories/ # Historiales médicos
│       │   ├── treatment_plans/   # Planes de tratamiento
│       │   ├── treatments/        # Catálogo de tratamientos
│       │   └── specialties/       # Especialidades odontológicas
│       ├── socket/        # Gateway WebSocket (Socket.io)
│       └── uploads/       # Subida de archivos (radiografías, etc.)
└── data.sql               # Esquema completo de la base de datos MySQL
```

---

## 🛠️ Stack tecnológico

### Frontend
- **Angular 18** + Angular Material 18
- **Tailwind CSS** para estilos utilitarios
- **RxJS** para programación reactiva
- **ApexCharts** para gráficas
- **Socket.io** (ngx-socket-io) para tiempo real
- **SweetAlert2** para notificaciones
- **jsPDF** para exportar reportes

### Backend
- **NestJS 11** (Node.js)
- **TypeORM** con **MySQL**
- **JWT** (Passport.js) + **bcrypt** para autenticación
- **Socket.io** para WebSockets
- **class-validator** para validación de DTOs
- **NestJS Schedule** para tareas programadas

### Base de datos
- **MySQL 8** — 14 tablas relacionales que cubren usuarios, pacientes, odontólogos, citas, historiales, tratamientos y planes.

---

## ⚙️ Configuración y ejecución

### Requisitos previos
- Node.js ≥ 18
- Yarn
- MySQL 8.0+

### 1. Base de datos

```bash
mysql -u root -p -e "CREATE DATABASE dental_clinic;"
mysql -u root -p dental_clinic < data.sql
```

> **Recomendación de seguridad:** crea un usuario dedicado con permisos mínimos en lugar de usar `root`:
> ```sql
> CREATE USER 'dental_user'@'localhost' IDENTIFIED BY 'contraseña_segura';
> GRANT SELECT, INSERT, UPDATE, DELETE ON dental_clinic.* TO 'dental_user'@'localhost';
> FLUSH PRIVILEGES;
> ```

### 2. Backend

```bash
cd backend
yarn install
```

Crea un archivo `.env` en `backend/` con las siguientes variables:

```env
DB_HOST=localhost
DB_USERNAME=dental_user
DB_PASSWORD=<contraseña_mysql>
DB_NAME=dental_clinic
PORT=4978
JWT_SECRET=<cadena_aleatoria_larga_y_segura>   # ej. generada con: openssl rand -hex 32
```

```bash
# Modo desarrollo (watch)
yarn start:dev

# Modo producción
yarn start:prod
```

La API queda disponible en `http://localhost:4978/api`.

### 3. Frontend

```bash
cd app
yarn install
yarn start
```

La aplicación queda disponible en `http://localhost:4200`.

> El entorno de desarrollo apunta automáticamente a `http://localhost:4978/api`.  
> Para producción, edita `app/src/environments/environment.ts`.

---

## 🗃️ Esquema de base de datos

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios del sistema con roles (`ADMIN`, `OPERADOR`) |
| `patients` | Pacientes con datos personales, seguro y balance |
| `dentists` | Odontólogos con especialidad y número de licencia |
| `dentist_schedules` | Horario semanal por odontólogo |
| `dentist_breaks` | Descansos dentro de la jornada |
| `dentist_unavailabilities` | Ausencias (vacaciones, enfermedad) |
| `appointments` | Citas con estado, tratamiento y notas |
| `medical_history` | Registros clínicos (diagnóstico, medicamentos, notas) |
| `treated_teeth` | Piezas dentales tratadas por historia clínica |
| `medical_attachments` | Archivos adjuntos (radiografías, imágenes) |
| `medical_alerts` | Alertas de salud del paciente (alergias, etc.) |
| `treatment_plans` | Planes de tratamiento con progreso y costo total |
| `treatment_procedures` | Procedimientos individuales dentro de un plan |
| `treatments` | Catálogo de tratamientos con precio y duración |
| `specialties` | Especialidades odontológicas disponibles |

---

## 🔑 Autenticación

- Login con usuario y contraseña (`POST /api/auth/login`)
- El token JWT se almacena en `sessionStorage`
- Las rutas protegidas requieren el header `Authorization: Bearer <token>`

---

## 🔌 WebSockets

El servidor expone un gateway en la misma URL base. Eventos disponibles:

| Evento | Dirección | Descripción |
|--------|-----------|-------------|
| `newAppointment` | Server → Client | Nueva cita creada |
| `appointmentUpdated` | Server → Client | Cita modificada |
| `appointmentCancelled` | Server → Client | Cita cancelada |

---

## 🧪 Tests

```bash
# Backend — tests unitarios (Jest)
cd backend && yarn test

# Backend — tests E2E
cd backend && yarn test:e2e

# Backend — cobertura
cd backend && yarn test:cov
```

> **Nota:** la cobertura actual es mínima. El backend incluye un test E2E de ejemplo y pruebas de spec para `specialties` y `patients`. El frontend no tiene tests configurados por el momento.

---

## 📁 Variables de entorno del frontend

| Archivo | Uso |
|---------|-----|
| `app/src/environments/environment.development.ts` | Desarrollo local |
| `app/src/environments/environment.ts` | Producción |

Campos configurables:
```ts
export const environment = {
    production: false,          // true en producción
    baseUrl: 'http://...',      // URL base de la API REST
    wsUrl:   'http://...',      // URL del servidor WebSocket
};
```

---

## 🚀 Build de producción

```bash
# Frontend
cd app && yarn build
# Salida en: app/dist/fuse/

# Backend
cd backend && yarn build && yarn start:prod
```

---

## ⚠️ Estado actual y trabajo pendiente

- **Inventario:** el componente de frontend muestra datos de ejemplo. Falta crear el módulo backend con su entidad, servicio, controlador y endpoints REST.
- **Configuraciones:** el formulario de ajustes de la clínica usa un `setTimeout` simulado en lugar de persistir en base de datos. Las especialidades sí se guardan correctamente.
- **Módulos deshabilitados en el backend:** `ClientesModule`, `HistoryModule`, `CitaModule`, `InventarioModule`, `FacturacionModule`, `ReservacionesModule` y `DefinicionesModule` están comentados en `app.module.ts`.
- **Token JWT:** se almacena en `sessionStorage`, lo que significa que se pierde al cerrar la pestaña. Considerar `localStorage` o un mecanismo de refresco de token.
- **Escalabilidad WebSocket:** el adaptador de Redis fue removido; el servidor de sockets solo funciona en instancia única.
