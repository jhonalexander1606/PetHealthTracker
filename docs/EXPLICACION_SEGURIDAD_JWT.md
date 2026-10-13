# Explicación de la solución — Login con Spring Boot y seguridad JWT

**Proyecto:** PetHealth Tracker — Pasaporte Sanitario Digital de Mascotas
**Materia:** Entornos de Programación — UIS 2026-II — Grupo 02
**Integrantes:** David Muñoz, Jhon Calderón, Juan Diego Téllez

---

## 1. Objetivo

Construir un login completo en el backend (Spring Boot) cuya seguridad se base
en **JSON Web Tokens (JWT)**, y consumirlo desde el frontend con **JavaScript
genérico usando la API `fetch`** (tecnología distinta al `XMLHttpRequest`
empleado por el profesor en los ejemplos de clase).

Además del login, se incorporó **control de acceso por roles** (ADMIN,
VETERINARIO, DUENO) para que cada tipo de usuario vea solo lo que le corresponde.

---

## 2. ¿Qué es JWT y por qué se usa?

Un **JWT** es un token firmado digitalmente que el servidor entrega al usuario
cuando inicia sesión correctamente. A partir de ese momento, el cliente envía
ese token en cada petición (en la cabecera `Authorization: Bearer <token>`), y
el servidor lo valida sin necesidad de guardar una sesión en memoria. Por eso se
dice que la autenticación es **stateless** (sin estado).

Un token JWT tiene tres partes separadas por puntos: `encabezado.cuerpo.firma`.
En el cuerpo (payload) viajan los *claims*; en este proyecto guardamos el nombre
de usuario (subject), el **rol** y el **id** del usuario. La firma garantiza que
el token no fue alterado, porque se calcula con una clave secreta que solo
conoce el servidor (algoritmo HS256).

---

## 3. Flujo completo de autenticación

```
  1. El usuario escribe usuario y contraseña en index.html
                     │
                     ▼
  2. login.js hace  fetch POST /api/auth/login  con las credenciales
                     │
                     ▼
  3. AuthController pide al AuthenticationManager que valide las credenciales.
     El UserDetailsServiceImpl busca el usuario en la BD y Spring compara la
     contraseña enviada contra el hash BCrypt almacenado.
                     │
         ┌───────────┴────────────┐
         ▼                        ▼
   credenciales OK          credenciales inválidas
         │                        │
         ▼                        ▼
  4a. JwtUtil genera un     4b. Responde 401 y el
      token firmado con         frontend muestra
      el rol y el id.           "usuario o contraseña
      Se devuelve el            incorrectos".
      token + datos.
         │
         ▼
  5. login.js guarda el token y los datos del usuario en sessionStorage
     y redirige a menu.html
                     │
                     ▼
  6. En cada petición siguiente, request.js agrega la cabecera
     "Authorization: Bearer <token>".
                     │
                     ▼
  7. El JwtAuthenticationFilter intercepta la petición, valida el token y,
     si es correcto, autoriza el acceso al endpoint protegido.
```

---

## 4. Componentes del backend (Spring Boot)

| Archivo | Responsabilidad |
|---------|-----------------|
| `pom.xml` | Se agregaron `spring-boot-starter-security` y la librería `jjwt` 0.11.5 (api, impl, jackson). |
| `seguridad/SecurityConfig.java` | Configuración central: define rutas públicas y protegidas, control por rol, sesiones *stateless*, BCrypt y CORS. |
| `seguridad/JwtUtil.java` | Genera y valida los tokens JWT (firma con HS256 y la clave secreta de `application.properties`). |
| `seguridad/JwtAuthenticationFilter.java` | Filtro que se ejecuta una vez por petición: lee el token de la cabecera, lo valida y autentica al usuario en el contexto de Spring Security. |
| `seguridad/UserDetailsServiceImpl.java` | Carga el usuario desde la base de datos y convierte su rol en una autoridad `ROLE_xxx`. |
| `controlador/AuthController.java` | Expone el endpoint público `POST /api/auth/login` que valida credenciales y devuelve el token. |
| `modelo/AuthResponse.java` | DTO de respuesta del login: token, id, usuario, nombre completo y rol. |
| `modelo/Usuario.java` | Se añadió el campo `rol`. |
| `servicio/UsuarioService.java` | Al crear o actualizar usuarios, la contraseña se cifra con **BCrypt** (nunca se guarda en texto plano). |

### Reglas de acceso definidas (SecurityConfig)

- **Público** (sin token): `POST /api/auth/login` y la documentación de Swagger.
- **Solo ADMIN**: crear, actualizar y eliminar usuarios
  (`POST /api/usuarios/save`, `PUT` y `DELETE` sobre `/api/usuarios/**`).
- **Cualquier usuario autenticado** (ADMIN, VETERINARIO o DUENO): el resto de la
  API (mascotas, eventos médicos, tipos de documento y consultas de usuarios).

---

## 5. Consumo desde el frontend (JavaScript con `fetch`)

- **`js/login.js`**: consume el login con la **API `fetch`** (requisito del
  profesor de usar una tecnología distinta a `XMLHttpRequest`). Si el login es
  correcto, guarda el token y los datos del usuario en `sessionStorage`.

- **`js/request.js`**: en cada petición al backend agrega automáticamente la
  cabecera `Authorization: Bearer <token>`. También protege las páginas: si se
  abre una página sin token, redirige al login; y si el servidor responde
  `401/403`, cierra la sesión.

- **Control por rol en la interfaz**:
  - El menú y la vista de **Usuarios** solo son visibles para el **ADMIN**.
  - Un **DUENO** solo ve sus propias mascotas y los eventos médicos de ellas.
  - El **VETERINARIO** ve todas las mascotas y eventos, pero no gestiona usuarios.

---

## 6. Contraseñas y roles

Las contraseñas se almacenan **cifradas con BCrypt**. Las credenciales de prueba
(el texto plano para iniciar sesión) son:

| Usuario | Contraseña | Rol | Qué puede ver |
|---------|-----------|-----|---------------|
| `admininicial` | `admin123456` | **ADMIN** | Todo, incluida la gestión de usuarios |
| `davidmunoz` | `123456` | **VETERINARIO** | Todas las mascotas y eventos (sin usuarios) |
| `jhoncalderon` | `123456` | **DUENO** | Solo sus mascotas y sus eventos |
| `juantellez` | `123456` | **DUENO** | Solo sus mascotas y sus eventos |

---

## 7. Cómo probar la seguridad

1. Iniciar sesión como `admininicial / admin123456`: se ve todo, incluido el
   módulo **Usuarios**.
2. Cerrar sesión e iniciar como `jhoncalderon / 123456`: **no** aparece el
   módulo Usuarios y en Mascotas solo se ven *Rocky* y *Luna*.
3. En Swagger (`/swagger-ui.html`), llamar a `GET /api/usuarios/list` sin token
   da **401**. Con el token de un ADMIN (botón *Authorize*), responde correctamente.
4. Intentar `POST /api/usuarios/save` con el token de un DUENO da **403**
   (no es administrador).

> Para autorizar en Swagger: iniciar sesión, copiar el token de la respuesta de
> `/api/auth/login`, pulsar **Authorize** y escribir `Bearer <token>`.

---

## 8. Posibles mejoras futuras

- Validación de expiración con *refresh tokens*.
- Restringir a nivel de backend (no solo de interfaz) que un DUENO consulte
  únicamente sus propias mascotas, usando el id del token con `@PreAuthorize`.
- Registro de intentos de acceso fallidos.
