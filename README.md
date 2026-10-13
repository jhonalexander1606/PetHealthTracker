# PetHealth Tracker

**Pasaporte Sanitario Digital y Control del Historial Médico de Mascotas**

> Proyecto final de la asignatura **Entornos de Programación**
> Universidad Industrial de Santander — Escuela de Ingeniería de Sistemas e Informática
> Semestre 2026-II — **Grupo 02**

---

## 📋 Tabla de contenido

1. [Descripción](#descripción)
2. [Equipo](#equipo)
3. [Arquitectura](#arquitectura)
4. [Tecnologías](#tecnologías)
5. [Estructura del repositorio](#estructura-del-repositorio)
6. [Instalación y ejecución](#instalación-y-ejecución)
7. [Base de datos](#base-de-datos)
8. [API REST — Endpoints](#api-rest--endpoints)
9. [Credenciales de prueba](#credenciales-de-prueba)
10. [Historias de usuario cubiertas](#historias-de-usuario-cubiertas)
11. [Capturas](#capturas)

---

## Descripción

**PetHealth Tracker** es una aplicación web que digitaliza el carnet sanitario físico de las mascotas (perros, gatos y otras especies). Permite llevar un control centralizado del historial médico — vacunas, consultas, desparasitaciones, cirugías — y programar recordatorios de próximas dosis para la medicina preventiva.

El sistema está diseñado para resolver tres problemas reales:
- 📄 **Pérdida y deterioro** del carnet físico de cartulina.
- ⏰ **Falta de alertas** para medicina preventiva.
- 🔀 **Fragmentación de datos** cuando la mascota se atiende fuera de su clínica habitual.

---

## Equipo

| Integrante | Cédula | Rol | Responsabilidad |
|-----------|--------|-----|-----------------|
| **David Fernando Muñoz Ortiz** | 2234504 | Product Owner / QA | CRUD de Mascotas |
| **Jhon Alexander Calderón Muñoz** | 2234570 | Scrum Master / Architecture | CRUD de Usuarios + Login |
| **Juan Diego Téllez Quintero** | 2234511 | Developer | CRUD de Eventos Médicos |

---

## Arquitectura

Arquitectura **cliente-servidor** basada en el patrón **MVC de 3 capas desacopladas**:

```
┌───────────────────────┐        HTTP / JSON        ┌──────────────────────┐
│   FRONTEND (Cliente)  │  ◄───────────────────►   │  BACKEND (Spring Boot)│
│   HTML + CSS + JS     │        AJAX              │   REST API            │
│   Bootstrap 5         │                          │   JPA / Hibernate     │
└───────────────────────┘                          └──────────┬───────────┘
                                                              │
                                                              │ JDBC
                                                              ▼
                                                   ┌──────────────────────┐
                                                   │   MySQL / MariaDB    │
                                                   │   pethealthtracker   │
                                                   └──────────────────────┘
```

Las **capas del backend** siguen el patrón visto en clase:

```
uis.edu.entorno.pethealth
├── modelo         → Entidades JPA (Usuario, Mascota, EventoMedico, TipoDocumento)
├── repositorio    → Interfaces JpaRepository con consultas JPQL
├── servicio       → Lógica de negocio (interfaces + implementaciones)
├── controlador    → Endpoints REST (@RestController)
└── config         → Configuración CORS
```

---

## Tecnologías

| Capa | Herramienta | Versión |
|------|-------------|---------|
| **Lenguaje** | Java | 17 |
| **IDE** | NetBeans | 18+ |
| **Framework backend** | Spring Boot | 2.7.10 |
| **ORM** | Spring Data JPA / Hibernate | — |
| **Base de datos** | MySQL / MariaDB | 8.x / 10.x |
| **Servidor** | Tomcat embebido | — |
| **Documentación API** | SpringDoc OpenAPI (Swagger UI) | 1.7.0 |
| **Build** | Maven | 3.9+ |
| **Frontend** | HTML5, CSS3, JavaScript (ES6) | — |
| **Framework CSS** | Bootstrap | 5.1.3 |
| **Iconos** | Bootstrap Icons | 1.11.1 |
| **Peticiones** | XMLHttpRequest (AJAX) | — |

---

## Estructura del repositorio

```
PetHealthTracker/
├── backend/                             ← Microservicio Spring Boot
│   ├── pom.xml
│   └── src/main/
│       ├── java/uis/edu/entorno/pethealth/
│       │   ├── PetHealthTrackerApplication.java
│       │   ├── modelo/           (TipoDocumento, Usuario, Mascota, EventoMedico, LoginDto)
│       │   ├── repositorio/      (4 interfaces JpaRepository)
│       │   ├── servicio/         (interfaces I* + implementaciones)
│       │   ├── controlador/      (4 @RestController)
│       │   └── config/           (WebConfig con CORS)
│       └── resources/
│           └── application.properties
│
├── frontend/                            ← Cliente web estático
│   ├── index.html         (Login)
│   ├── menu.html          (Dashboard principal)
│   ├── usuarios.html      + form_usuarios.html
│   ├── mascotas.html      + form_mascotas.html
│   ├── eventos.html       + form_eventos.html
│   ├── css/   (login.css, style.css)
│   └── js/    (request.js, login.js, usuarios.js, mascotas.js, eventos.js)
│
├── database/
│   └── pethealthtracker.sql             ← Script de creación + datos de prueba
│
├── docs/
│   ├── Informe_Tecnico_Sprint3y4.md     ← Informe técnico Sprint 3 y 4
│   └── Guion_Sustentacion.md            ← Guión para la presentación
│
├── .gitignore
└── README.md
```

---

## Instalación y ejecución

### 1. Requisitos previos

- **Java JDK 17** instalado y configurado (`JAVA_HOME`).
- **Maven 3.9+** (o usar NetBeans con Maven embebido).
- **MySQL 8.x o MariaDB 10.x** corriendo en `localhost:3307`.
- **NetBeans 18+** (recomendado) o Spring Tool Suite 4.
- Un navegador moderno (Chrome / Edge / Firefox).

### 2. Crear la base de datos

Abra MySQL Workbench (o HeidiSQL) y ejecute el script:

```bash
mysql -u root -p < database/pethealthtracker.sql
```

Esto crea la BD `pethealthtracker` con las 4 tablas y datos de prueba (incluyendo el usuario administrador por defecto).

### 3. Configurar la conexión

Edite `backend/src/main/resources/application.properties` y ajuste la contraseña de MySQL si es necesario:

```properties
spring.datasource.username=root
spring.datasource.password=   ← aquí su contraseña
```

### 4. Arrancar el backend

**Opción A — con NetBeans:**
1. `File` → `Open Project` → seleccione la carpeta `backend/`.
2. Click derecho sobre el proyecto → **Run** (o `F6`).
3. Verá en la consola:
   ```
   Tomcat started on port(s): 8094 (http)
   Started PetHealthTrackerApplication in X seconds
   ```

**Opción B — por consola:**
```bash
cd backend
mvn spring-boot:run
```

### 5. Abrir el frontend

Abra directamente `frontend/index.html` en el navegador (doble click), o sírvalo con cualquier servidor estático simple:

```bash
cd frontend
python3 -m http.server 5500
# navegar a http://localhost:5500
```

### 6. Probar la API con Swagger

En su navegador: **http://localhost:8094/swagger-ui.html**

---

## Base de datos

Diseño relacional con 4 tablas e integridad referencial:

```
┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│  tipodocumento   │          │     usuario      │          │     mascota      │
├──────────────────┤          ├──────────────────┤          ├──────────────────┤
│ id (PK)          │◄────┐    │ id (PK)          │◄────┐    │ id (PK)          │
│ tipo             │     │    │ idTipoDocumento  │─────┘    │ idUsuario        │─────┘
└──────────────────┘     │    │ numeroDocumento  │          │ nombre, especie, │
                         │    │ nombreCompleto   │          │ raza, edad, sexo,│
                         └────│ email, telefono  │          │ peso, color      │
                              │ nombreUsuario    │          └──────┬───────────┘
                              │ password         │                 │
                              └──────────────────┘                 │
                                                                   ▼
                                                     ┌──────────────────────┐
                                                     │    eventomedico      │
                                                     ├──────────────────────┤
                                                     │ id (PK)              │
                                                     │ idMascota (FK)       │
                                                     │ tipoEvento           │
                                                     │ fechaAplicacion      │
                                                     │ veterinariaClinica   │
                                                     │ veterinario          │
                                                     │ notasDiagnostico     │
                                                     │ fechaProximaDosis    │
                                                     └──────────────────────┘
```

---

## API REST — Endpoints

Base URL: `http://localhost:8094`

### 🔐 Autenticación (Login)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/usuarios/loginclient` | Valida credenciales → devuelve `1` (OK) o `0` (fallo). |
| POST | `/api/usuarios/login` | Login completo → devuelve el objeto `Usuario`. |

### 👤 Usuarios (CRUD de Jhon)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/usuarios/list` | Lista todos |
| GET | `/api/usuarios/{id}` | Buscar por ID |
| GET | `/api/usuarios/cedula/{numeroDocumento}` | Buscar por cédula (HU003) |
| POST | `/api/usuarios/save` | Crear nuevo (HU002) |
| PUT | `/api/usuarios/update/{id}` | Actualizar (HU004) |
| DELETE | `/api/usuarios/delete/{id}` | Eliminar (HU005) |

### 🐾 Mascotas (CRUD de David)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/mascotas/list` | Lista todas |
| GET | `/api/mascotas/{id}` | Buscar por ID |
| GET | `/api/mascotas/usuario/{idUsuario}` | Mascotas de un dueño (RNF-03) |
| POST | `/api/mascotas/save` | Registrar nueva (HU006) |
| PUT | `/api/mascotas/update/{id}` | Actualizar |
| DELETE | `/api/mascotas/delete/{id}` | Eliminar |

### 💉 Eventos Médicos (CRUD de Juan Diego)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/eventos/list` | Lista todos |
| GET | `/api/eventos/{id}` | Buscar por ID |
| GET | `/api/eventos/mascota/{idMascota}` | Historial de una mascota (RF-06) |
| POST | `/api/eventos/save` | Registrar vacuna/consulta (HU007) |
| PUT | `/api/eventos/update/{id}` | Actualizar |
| DELETE | `/api/eventos/delete/{id}` | Eliminar |

### 📄 Tipos de documento (auxiliar)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/tipodocumento/list` | Lista tipos (CEDULA, TARJETA DE IDENTIDAD, etc.) |

---

## Credenciales de prueba

Al ejecutar el script `database/pethealthtracker.sql` quedan creados estos usuarios:

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admininicial` | `admin123456` | Administrador inicial del sistema |
| `jhoncalderon` | `123456` | Jhon Alexander Calderón |
| `davidmunoz` | `123456` | David Fernando Muñoz |
| `juantellez` | `123456` | Juan Diego Téllez |

---

## Historias de usuario cubiertas

| ID | Historia | Sprint | Estado |
|----|----------|--------|--------|
| HU001 | Login con credenciales | 1 | ✅ Hecho |
| HU002 | Crear nuevos usuarios | 1 | ✅ Hecho |
| HU003 | Consultar usuario por cédula | 1 | ✅ Hecho |
| HU004 | Actualizar datos de usuario | 1 | ✅ Hecho |
| HU005 | Eliminar usuario | 1 | ✅ Hecho |
| HU006 | Registrar ficha básica de mascota | 1-3 | ✅ Hecho (CRUD completo) |
| HU007 | Registrar evento médico con próxima dosis | 3-4 | ✅ Hecho |
| HU008 | Consultar historial cronológico de una mascota | 4 | ✅ Hecho (ordenado DESC) |

---

## Capturas

Las capturas de las pantallas (login, menú, CRUDs) se incluyen en el documento `docs/Informe_Tecnico_Sprint3y4.md`.

---

> © 2026 — Universidad Industrial de Santander — Grupo 02 — Entornos de Programación
