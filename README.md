# PetHealth Tracker — Proyecto Completo

> **Pasaporte Sanitario Digital y Control del Historial Médico de Mascotas**
> Proyecto final del curso **Entornos de Programación** — Universidad Industrial de Santander
> Semestre 2026-II — **Grupo 02**

Proyecto cliente-servidor con:
- **Backend**: Spring Boot + JWT + MySQL
- **Frontend**: React + Vite + Axios + Bootstrap

###  Funciones principales
- Login con **JWT** y tres roles (ADMIN, VETERINARIO, DUENO); cada dueño solo ve sus mascotas.
- **Dashboard** con indicadores, gráficas y **alertas de vacunas vencidas o próximas**.
- **Pasaporte Sanitario Digital** por mascota, con **código QR**, línea de tiempo e impresión en PDF.
- **Calendario de vacunación** mensual.
- CRUD de usuarios, mascotas y eventos médicos con búsqueda, filtros, orden, paginación y **exportar a Excel**.
- Validaciones de negocio en backend y frontend; borrado en cascada controlado.
- Mi perfil (datos y cambio de contraseña), **modo oscuro** y diseño adaptable a celular.

Detalle completo en [`docs/FUNCIONES_AVANZADAS.md`](docs/FUNCIONES_AVANZADAS.md).

---

##  Equipo

| Integrante | Cédula | Rol | CRUD |
|-----------|--------|-----|------|
| David Fernando Muñoz Ortiz | 2234504 | PO / QA | Mascotas |
| Jhon Alexander Calderón Muñoz | 2234570 | SM / Architecture | Usuarios + Login/JWT |
| Juan Diego Téllez Quintero | 2234511 | Developer | Eventos Médicos |

---

##  Estructura del proyecto

```
PetHealthTracker/
├── backend/              ← API REST en Spring Boot 2.7 con JWT
│   ├── pom.xml
│   └── src/main/java/uis/edu/entorno/pethealth/
│       ├── modelo/
│       ├── repositorio/
│       ├── servicio/
│       ├── controlador/  ← CRUDs + DashboardController + PerfilController + ManejadorErrores
│       └── seguridad/    ← JwtUtil, JwtAuthenticationFilter, SecurityConfig, UsuarioAutenticado
│
├── frontend-react/       ← Cliente SPA en React + Vite (NUEVO)
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx           ← rutas anidadas con React Router
│       ├── services/         ← capa Axios
│       ├── hooks/            ← useTabla (busqueda, orden, paginacion)
│       ├── utils/            ← fechas, exportar CSV, JWT, tema
│       └── components/       ← Dashboard, Pasaporte, Calendario, Perfil, CRUDs
│
├── database/
│   ├── pethealthtracker.sql  ← script de creación + datos de prueba
│   └── datos_demo.sql        ← (opcional) más mascotas y eventos para la demo
│
└── docs/
    ├── Informe_Tecnico_Sprint3y4.md
    ├── EXPLICACION_SEGURIDAD_JWT.md
    ├── FUNCIONES_AVANZADAS.md
    └── diseno_base_datos.png
```

---

##  Puesta en marcha (orden)

### 1. Base de datos — MySQL / MariaDB

Debe correr en `localhost:3307` (puerto configurado en `application.properties`).

```bash
mysql -u root -P 3307 < database/pethealthtracker.sql
```

Esto crea la base `pethealthtracker` con 4 tablas y usuarios de prueba.

**Recomendado para la demo:** ejecute también `database/datos_demo.sql`. Agrega dueños, mascotas y eventos con fechas calculadas desde **hoy**, así siempre hay vacunas vencidas y próximas en las alertas. Se puede ejecutar varias veces sin duplicar datos.

### 2. Backend — Spring Boot (puerto 8094)

**Opción NetBeans:** `File → Open Project → backend/` → click derecho → **Run** (F6).

**Opción terminal:**

```bash
cd backend
mvn spring-boot:run
```

Verifica:
- API: <http://localhost:8094/api/auth/login> (POST)
- Swagger: <http://localhost:8094/swagger-ui.html>

### 3. Frontend React (puerto 5173)

```bash
cd frontend-react
npm install
npm run dev
```

Abre <http://localhost:5173>.

---

##  Credenciales de prueba

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admininicial` | `admin123456` | **ADMIN** (único que puede crear/editar/borrar usuarios) |
| `davidmunoz` | `123456` | VETERINARIO |
| `jhoncalderon` | `123456` | DUENO |
| `juantellez` | `123456` | DUENO |
| `mariarojas`, `carlosperez` | `123456` | DUENO *(datos_demo.sql)* |
| `draluragomez` | `123456` | VETERINARIO *(datos_demo.sql)* |

---

## 📡 Stack técnico

### Backend
- Java 17 + **Spring Boot 2.7.10**
- **Spring Security + JWT (HS256)** con BCrypt para hashear contraseñas
- Spring Data JPA + Hibernate
- MySQL / MariaDB (puerto 3307)
- SpringDoc OpenAPI (Swagger)
- Arquitectura MVC de 3 capas

### Frontend React (siguiendo el PDF del profe)
- **Vite** + **React 18**
- **Axios** con interceptor para adjuntar el JWT en cada petición
- **React Router DOM v6**
- **Bootstrap 5** + **Font Awesome**
- **SweetAlert2** para confirmaciones

---

##  Endpoints principales

Base URL: `http://localhost:8094`

| Método | Ruta | Acceso |
|--------|------|--------|
| POST | `/api/auth/login` | público |
| GET | `/api/usuarios/list` | autenticado |
| POST | `/api/usuarios/save` | **solo ADMIN** |
| PUT | `/api/usuarios/update/{id}` | **solo ADMIN** |
| DELETE | `/api/usuarios/delete/{id}` | **solo ADMIN** |
| GET/POST/PUT/DELETE | `/api/mascotas/**` | autenticado |
| GET/POST/PUT/DELETE | `/api/eventos/**` | autenticado |
| GET | `/api/tipodocumento/list` | autenticado |
| GET | `/api/dashboard/resumen` | autenticado (un DUENO solo recibe lo suyo) |
| GET / PUT | `/api/perfil` | autenticado (cuenta propia) |
| PUT | `/api/perfil/password` | autenticado (exige la contraseña actual) |

Documentación interactiva completa: <http://localhost:8094/swagger-ui.html>

---

##  Despliegue

El **frontend** se despliega en Vercel en 2 clicks (detecta Vite automáticamente). Guía completa en `frontend-react/INSTRUCCIONES_PASO_A_PASO.md`.

Para el **backend**, las opciones gratuitas son Render.com (Spring Boot) + Aiven (MySQL).

En la sustentación es válido mostrar el frontend online (Vercel) y el backend corriendo local — así se evita el costo y complejidad de desplegar la base de datos.

---

## 📚 Documentación adicional

Dentro de `docs/` encontrarás:
- **PUBLICAR_CON_TUNEL.md**: cómo abrir la app desde otro computador con un túnel de Cloudflare
- **FUNCIONES_AVANZADAS.md**: funciones nuevas, reglas de negocio, guion de demostración y reparto de la sustentación
- **Informe_Tecnico_Sprint3y4.md** — informe técnico de la entrega
- **EXPLICACION_SEGURIDAD_JWT.md** — cómo funciona el JWT paso a paso
- **diseno_base_datos.png** — diagrama entidad-relación

En `frontend-react/README.md` está la documentación específica del frontend React y el mapeo de cada sección del PDF del profe con el código entregado.

---

> © 2026 — Universidad Industrial de Santander — Entornos de Programación — Grupo 02
