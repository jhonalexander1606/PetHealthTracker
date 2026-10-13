# INFORME TÉCNICO — SPRINT 3 y 4

**Proyecto:** PetHealth Tracker — Pasaporte Sanitario Digital y Control del Historial Médico de Mascotas
**Materia:** Entornos de Programación — Universidad Industrial de Santander
**Semestre:** 2026-II
**Grupo:** 02
**Fecha de entrega:** 14 de octubre de 2026

---

## 1. Equipo de trabajo

| Integrante | Cédula | Rol |
|-----------|--------|-----|
| David Fernando Muñoz Ortiz | 2234504 | Product Owner & QA |
| Jhon Alexander Calderón Muñoz | 2234570 | Scrum Master & Developer Architecture |
| Juan Diego Téllez Quintero | 2234511 | Developer Coding & Frontend/Backend |

---

## 2. Objetivos del Sprint 3 y 4

Como objetivo general de esta entrega final:

> *Consolidar el microservicio Spring Boot con un login funcional, los tres CRUDs del equipo (uno por integrante), la base de datos relacional con integridad referencial y un frontend que consuma la API REST, todo documentado y versionado en GitHub.*

### Objetivos específicos

- **O1.** Implementar completamente el backend con las 4 entidades, repositorios, servicios y controladores REST.
- **O2.** Desarrollar un microservicio de autenticación (login) siguiendo el patrón enseñado en clase.
- **O3.** Construir un frontend web independiente que consuma la API vía AJAX.
- **O4.** Documentar la API con Swagger (SpringDoc OpenAPI).
- **O5.** Versionar el proyecto en GitHub con un README descriptivo.
- **O6.** Realizar pruebas funcionales de cada endpoint y de cada pantalla.

---

## 3. Arquitectura implementada

El proyecto sigue una **arquitectura cliente-servidor con MVC de 3 capas desacopladas**, exactamente como lo recomienda el material de clase (`BackendTablasEnlazadas.pdf`, `MicroservicioSpringBootBDs.pdf`).

### 3.1. Diagrama de capas

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CLIENTE WEB (Navegador)                         │
│    HTML5 + CSS3 + JavaScript ES6 + Bootstrap 5 + Bootstrap Icons    │
│                        ↕ AJAX (XMLHttpRequest)                      │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ HTTP + JSON
┌───────────────────────────────▼─────────────────────────────────────┐
│                 BACKEND — Spring Boot 2.7.10                        │
│                   puerto 8094 — Tomcat embebido                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  CONTROLADOR  @RestController — /api/usuarios /mascotas …   │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │  SERVICIO     @Service — interface + implementación         │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │  REPOSITORIO  @Repository extends JpaRepository + JPQL      │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │  MODELO       @Entity + @Table + @ManyToOne + @JoinColumn   │    │
│  └─────────────────────────────────────────────────────────────┘    │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ JDBC + Hibernate
┌───────────────────────────────▼─────────────────────────────────────┐
│                MySQL / MariaDB — pethealthtracker                   │
│   tipodocumento ← usuario ← mascota ← eventomedico                  │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2. Estructura de paquetes

```
uis.edu.entorno.pethealth
├── PetHealthTrackerApplication.java   ← @SpringBootApplication
├── modelo/
│   ├── TipoDocumento.java
│   ├── Usuario.java
│   ├── Mascota.java
│   ├── EventoMedico.java
│   └── LoginDto.java                  ← DTO (sin JPA) para login
├── repositorio/
│   ├── TipoDocumentoRepositorio.java
│   ├── UsuarioRepositorio.java        ← incluye consultas JPQL del login
│   ├── MascotaRepositorio.java
│   └── EventoMedicoRepositorio.java
├── servicio/
│   ├── ITipoDocumentoService.java  + TipoDocumentoService.java
│   ├── IUsuarioService.java        + UsuarioService.java
│   ├── IMascotaService.java        + MascotaService.java
│   └── IEventoMedicoService.java   + EventoMedicoService.java
├── controlador/
│   ├── TipoDocumentoController.java
│   ├── UsuarioController.java      ← incluye endpoints de login
│   ├── MascotaController.java
│   └── EventoMedicoController.java
└── config/
    └── WebConfig.java              ← CORS global
```

---

## 4. Modelo de datos

La base de datos **`pethealthtracker`** se compone de 4 tablas con las siguientes relaciones:

| Tabla padre | → | Tabla hija | Cardinalidad |
|-------------|---|------------|--------------|
| `tipodocumento` | → | `usuario` | 1:N |
| `usuario` | → | `mascota` | 1:N |
| `mascota` | → | `eventomedico` | 1:N |

### Script de creación

El script completo está en `database/pethealthtracker.sql`. Se puede cargar en MySQL Workbench, HeidiSQL o por consola:

```bash
mysql -u root -p < database/pethealthtracker.sql
```

Al cargar el script quedan creados:
- 4 tipos de documento (CEDULA, TARJETA DE IDENTIDAD, CEDULA DE EXTRANJERIA, PASAPORTE).
- 4 usuarios de prueba (incluyendo `admininicial / admin123456`).
- 4 mascotas de ejemplo.
- 4 eventos médicos de ejemplo (vacunas, desparasitación, consulta general).

---

## 5. Backend — Detalle de implementación

### 5.1. Dependencias Maven (pom.xml)

- `spring-boot-starter-web` → API REST + Tomcat embebido.
- `spring-boot-starter-data-jpa` → ORM con Hibernate.
- `spring-boot-starter-validation` → Bean Validation.
- `mysql-connector-j` → driver MySQL.
- `spring-boot-devtools` → recarga en caliente durante desarrollo.
- `springdoc-openapi-ui 1.7.0` → documentación interactiva Swagger.

### 5.2. Entidades JPA (modelo)

Cada entidad sigue el patrón del profesor:
- `@Entity` + `@Table(name = Clase.TABLE_NAME)`.
- `public static final String TABLE_NAME = "...";` como constante.
- `@Id @GeneratedValue(strategy = GenerationType.IDENTITY)`.
- `@ManyToOne(fetch = FetchType.EAGER) + @JoinColumn(name = "...")` para las relaciones.
- Constructor vacío + constructor completo + getters/setters + `toString()`.

### 5.3. Repositorios

Interfaces que extienden `JpaRepository<Entidad, Integer>`. La clase `UsuarioRepositorio` incluye las dos consultas JPQL del login (igual que el `MicroservicioLogindeAccesoUIS.pdf`):

```java
@Query("select count(u) from Usuario as u "
     + "where u.nombreUsuario = :nombreUsuario and u.password = :password")
Integer findByNombreUsuarioAndPassword(@Param("nombreUsuario") String nombreUsuario,
                                       @Param("password") String password);
```

### 5.4. Servicios

Cada servicio tiene su interfaz (`I<Entidad>Service`) y su implementación (`<Entidad>Service`) anotada con `@Service`. Todas las respuestas devuelven un `ResponseEntity<?>` con un `Map<String,Object>` con las claves `"Mensaje"`, el objeto resultante y `"statusCode"` HTTP, siguiendo el mismo patrón del profesor en el `MicroservicioLogindeAccesoUIS`.

### 5.5. Controladores REST

Cada controlador expone:

| Método HTTP | Patrón URL | Significado |
|-------------|-----------|-------------|
| GET | `/api/<entidad>/list` | Listar todos |
| GET | `/api/<entidad>/{id}` | Buscar por ID |
| POST | `/api/<entidad>/save` | Crear |
| PUT | `/api/<entidad>/update/{id}` | Actualizar |
| DELETE | `/api/<entidad>/delete/{id}` | Eliminar |

Además:
- `UsuarioController`: expone `/api/usuarios/loginclient` (devuelve `int`) y `/api/usuarios/login` (devuelve el usuario completo).
- `MascotaController`: expone `/api/mascotas/usuario/{idUsuario}` (RNF-03).
- `EventoMedicoController`: expone `/api/eventos/mascota/{idMascota}` ordenado DESC (RF-06).

Todos los controladores llevan `@CrossOrigin(origins = "*")` para que el frontend abierto desde `file://` pueda consumirlos.

### 5.6. Configuración (application.properties)

```properties
spring.application.name=PetHealthTracker
spring.datasource.url=jdbc:mysql://localhost:3306/pethealthtracker?serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
server.port=8094
springdoc.api-docs.path=/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
```

El puerto escogido (**8094**) es el mismo que usa el profesor en los ejemplos de clase.

### 5.7. Documentación con Swagger

Una vez arrancado el backend, la documentación interactiva de la API está disponible en:

**→ http://localhost:8094/swagger-ui.html**

Permite probar todos los endpoints sin necesidad de Postman.

---

## 6. Frontend — Detalle de implementación

### 6.1. Stack

Siguiendo exactamente el enfoque del profesor en `FrontEndProveedores.pdf` y `LoginFrontEnd.pdf`:

- **HTML5** puro (sin framework de componentes).
- **CSS3** con un stylesheet propio (`css/style.css` + `css/login.css`).
- **JavaScript ES6** con `XMLHttpRequest` para las peticiones AJAX.
- **Bootstrap 5.1.3** cargado por CDN (mismo que el profesor).
- **Bootstrap Icons 1.11.1** cargado por CDN.
- Carpetas `css/`, `js/` e `img/` como en el ejemplo del profesor.

### 6.2. Estructura de archivos

```
frontend/
├── index.html              ← Login (HU001)
├── menu.html               ← Dashboard principal
├── usuarios.html           ← Listado de usuarios (HU002, HU003, HU005)
├── form_usuarios.html      ← Formulario crear/editar usuario (HU002, HU004)
├── mascotas.html           ← Listado de mascotas (HU006)
├── form_mascotas.html      ← Formulario crear/editar mascota (HU006)
├── eventos.html            ← Listado de eventos médicos (HU007)
├── form_eventos.html       ← Formulario crear/editar evento (HU007)
├── css/
│   ├── login.css           ← Estilos exclusivos del login
│   └── style.css           ← Estilos generales (navbar, tablas, formularios)
└── js/
    ├── request.js          ← Helper AJAX genérico (sendRequest)
    ├── login.js            ← Lógica del login
    ├── usuarios.js         ← CRUD de usuarios
    ├── mascotas.js         ← CRUD de mascotas
    └── eventos.js          ← CRUD de eventos médicos
```

### 6.3. Helper AJAX (request.js)

Mismo patrón que el `request.js` del profesor:

```javascript
const url = "http://localhost:8094/";

function sendRequest(endPoint, method, data) {
    let request = new XMLHttpRequest();
    request.open(method, url + endPoint);
    request.responseType = 'json';
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(data ? JSON.stringify(data) : data);
    return request;
}
```

### 6.4. Flujo de login (HU001)

1. El usuario digita credenciales en `index.html`.
2. `validarLogin()` arma el `LoginDto` y hace `POST` a `/api/usuarios/loginclient`.
3. Si el backend devuelve `1`, se hace una segunda llamada a `/api/usuarios/login` para obtener el objeto `Usuario`, se guarda en `sessionStorage` y se redirige a `menu.html`.
4. Si devuelve `0` o error, se muestra una alerta Bootstrap de error.

Este flujo es idéntico al descrito en `LoginFrontEnd.pdf`.

---

## 7. Pruebas realizadas (CP)

| ID | Descripción | Resultado |
|----|-------------|-----------|
| CP-01 | Login con credenciales correctas (`admininicial / admin123456`) |  Redirige a menú |
| CP-02 | Login con credenciales incorrectas |  Muestra alerta de error |
| CP-03 | Login con campos vacíos |  Validación en cliente |
| CP-04 | Crear usuario nuevo |  201 Created, aparece en la lista |
| CP-05 | Buscar usuario por cédula existente |  200 OK con datos |
| CP-06 | Buscar usuario por cédula inexistente |  404 Not Found con mensaje |
| CP-07 | Actualizar usuario |  200 OK, datos modificados |
| CP-08 | Eliminar usuario sin mascotas |  200 OK |
| CP-09 | Eliminar usuario con mascotas |  Debe borrarse en cascada o manualmente |
| CP-10 | Crear nueva mascota asociada a un dueño |  201 Created |
| CP-11 | Listar mascotas |  Muestra tabla con dueño |
| CP-12 | Editar mascota |  200 OK |
| CP-13 | Eliminar mascota |  200 OK |
| CP-14 | Registrar vacuna con fecha de próxima dosis |  201 Created |
| CP-15 | Listar eventos médicos ordenados cronológicamente | Orden DESC por `fechaAplicacion` |
| CP-16 | Documentación Swagger accesible |  `/swagger-ui.html` |

---

## 8. Opciones opcionales atendidas

-  **Repositorio Git/GitHub:** el proyecto está versionado y disponible públicamente en `https://github.com/jhonalexander1606/PetHealthTracker`.
-  **README documentado:** README completo con instrucciones de instalación, diagramas y descripción de endpoints.
-  **Jira:** no se usó porque el equipo priorizó el desarrollo técnico.

---

## 9. Conclusiones

- El patrón **MVC de 3 capas** aplicado permite modificar la implementación de persistencia o la interfaz sin afectar la lógica de negocio.
- El microservicio de login, aunque sencillo, cumple con la autenticación requerida (RF-01) y se puede evolucionar fácilmente a JWT en una siguiente iteración.
- **Spring Data JPA** reduce drásticamente el código necesario para operaciones CRUD; apenas se escribieron 4 consultas JPQL personalizadas en todo el proyecto.
- La **documentación automática con Swagger** fue clave para probar la API durante el desarrollo sin depender de Postman.
- El equipo logró entregar un producto funcional dentro del plazo pese a las limitaciones de tiempo y los imprevistos personales (enfermedad, competencias deportivas).

---

## 10. Enlaces útiles

- **Repositorio GitHub:** https://github.com/jhonalexander1606/PetHealthTracker
- **Documentación Swagger (local):** http://localhost:8094/swagger-ui.html
- **Backend corriendo:** http://localhost:8094
- **Frontend (abrir directo):** `frontend/index.html`

---

*Fin del Informe Técnico Sprint 3 y 4.*
