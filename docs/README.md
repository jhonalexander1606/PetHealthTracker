# 🐾 PetHealth Tracker

**Pasaporte Sanitario Digital y Control del Historial Médico de Mascotas**

Proyecto de la asignatura **Entornos de Programación** — Universidad Industrial de Santander (UIS) — 2026-II — **Grupo 02**.

Aplicación web para registrar dueños, mascotas y su historial médico (vacunas, consultas, desparasitaciones), con **login seguro mediante JWT** y **control de acceso por roles**.

---

## 👥 Integrantes

| Integrante | CRUD a cargo |
|------------|--------------|
| Jhon Alexander Calderón Muñoz | CRUD de **Usuarios** |
| David Fernando Muñoz Ortiz | CRUD de **Mascotas** |
| Juan Diego Téllez Quintero | CRUD de **Eventos Médicos** |

---

## 🧰 Tecnologías

**Backend**
- Java 17
- Spring Boot 2.7.10 (Spring Web, Spring Data JPA, Spring Security)
- JSON Web Token (jjwt 0.11.5)
- MySQL 8
- Maven
- Swagger / SpringDoc OpenAPI

**Frontend**
- HTML, CSS y JavaScript puro (sin frameworks)
- Bootstrap 5 (estilos)
- `fetch` para el login y `XMLHttpRequest` para el resto de peticiones

---

## ✨ Funcionalidades

- **Login seguro con JWT**: la contraseña se valida en el servidor y se entrega un token firmado que viaja en cada petición.
- **Contraseñas cifradas** con BCrypt (nunca se guardan ni se devuelven en texto plano).
- **Control de acceso por roles**: ADMIN, VETERINARIO y DUENO.
- **Tres CRUD completos**: Usuarios, Mascotas y Eventos Médicos.
- **Documentación interactiva de la API** con Swagger.

### Roles y permisos

| Rol | Qué puede hacer |
|-----|-----------------|
| **ADMIN** | Todo: gestiona usuarios, mascotas y eventos. |
| **VETERINARIO** | Ve todas las mascotas y sus eventos, y los datos de contacto del dueño. No gestiona usuarios. |
| **DUENO** | Solo ve y gestiona sus propias mascotas y los eventos de ellas. |

---

## 🗄️ Diseño de la base de datos

La base de datos `pethealthtracker` tiene 4 tablas relacionadas:

![Modelo Entidad-Relación](docs/diseno_base_datos.png)

- `tipodocumento` **(1)** → **(N)** `usuario` — un tipo de documento lo usan muchos usuarios.
- `usuario` **(1)** → **(N)** `mascota` — un dueño tiene muchas mascotas.
- `mascota` **(1)** → **(N)** `eventomedico` — una mascota tiene muchos eventos médicos.

El script completo está en [`database/pethealthtracker.sql`](database/pethealthtracker.sql).

---

## 📁 Estructura del proyecto

```
PetHealthTracker/
├── backend/                 # Microservicio Spring Boot (API REST)
│   ├── src/main/java/uis/edu/entorno/pethealth/
│   │   ├── modelo/          # Entidades JPA (Usuario, Mascota, EventoMedico, ...)
│   │   ├── repositorio/     # Acceso a datos (Spring Data JPA)
│   │   ├── servicio/        # Lógica de negocio
│   │   ├── controlador/     # Endpoints REST (incluye AuthController del login)
│   │   └── seguridad/       # JWT y Spring Security
│   └── src/main/resources/application.properties
├── frontend/                # Interfaz web (HTML/CSS/JS)
│   ├── index.html           # Login
│   ├── menu.html            # Panel principal
│   ├── usuarios.html / mascotas.html / eventos.html
│   └── js/                  # login.js, request.js y los CRUD
├── database/
│   └── pethealthtracker.sql # Script de creación + datos de ejemplo
└── docs/                    # Documentación (diseño BD, explicación JWT, guion)
```

---

## 🚀 Instalación y ejecución

### Requisitos
- **Java JDK 17** (https://adoptium.net/temurin/releases/?version=17)
- **MySQL 8** + MySQL Workbench
- **NetBeans 18 o superior**

### Pasos

**1. Crear la base de datos**
Abre MySQL Workbench, abre `database/pethealthtracker.sql` y ejecútalo. Crea la base con sus 4 tablas y datos de ejemplo.

**2. Configurar la conexión**
En `backend/src/main/resources/application.properties`, ajusta a tu MySQL local:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/pethealthtracker?serverTimezone=UTC&useUnicode=true&characterEncoding=utf8
spring.datasource.username=root
spring.datasource.password=TU_CONTRASEÑA
```

**3. Ejecutar el backend**
Abre la carpeta `backend` como proyecto Maven en NetBeans y ejecútalo (`spring-boot:run`).
El backend corre en `http://localhost:8094`. La documentación está en `http://localhost:8094/swagger-ui.html`.

**4. Abrir el frontend**
Abre `frontend/index.html` en el navegador.

### Credenciales de prueba

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admininicial` | `admin123456` | ADMIN |
| `davidmunoz` | `123456` | VETERINARIO |
| `jhoncalderon` | `123456` | DUENO |
| `juantellez` | `123456` | DUENO |

---

## 🔐 Seguridad (JWT)

El login (`POST /api/auth/login`) valida las credenciales y devuelve un **token JWT**. El frontend lo guarda y lo envía en cada petición (`Authorization: Bearer <token>`). El servidor valida el token en cada llamada y autoriza según el rol. Sin un token válido, los endpoints responden `401`.

La explicación detallada está en [`docs/EXPLICACION_SEGURIDAD_JWT.md`](docs/EXPLICACION_SEGURIDAD_JWT.md).

---

## 📚 Documentación adicional

- [`docs/EXPLICACION_SEGURIDAD_JWT.md`](docs/EXPLICACION_SEGURIDAD_JWT.md) — cómo se implementó el login con JWT.
- [`docs/GUION_SUSTENTACION.md`](docs/GUION_SUSTENTACION.md) — explicación completa del proyecto y guion de la presentación.
- [`docs/Informe_Tecnico_Sprint3y4.md`](docs/Informe_Tecnico_Sprint3y4.md) — informe técnico.
