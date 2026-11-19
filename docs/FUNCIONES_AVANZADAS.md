# PetHealth Tracker: funciones avanzadas (versión 2.0)

Este documento explica todo lo que se agregó sobre los CRUD básicos: qué hace cada función, en qué archivos está y cómo mostrarla en la sustentación.

---

## 1. Resumen de cambios

| Área | Antes | Ahora |
|------|-------|-------|
| Panel principal | 4 tarjetas de acceso | Dashboard con indicadores, 3 gráficas, alertas de vacunación y actividad reciente |
| Mascotas | Tabla simple | Tabla **o** tarjetas, búsqueda, filtros, orden, paginación, exportar a Excel, estado sanitario |
| Historial médico | Tabla simple | Estado de cada dosis (vencida / próxima / al día / renovada), filtros por tipo, estado y fechas |
| Usuarios | Tabla + búsqueda por cédula | Filtro por rol, búsqueda instantánea, conteo de mascotas, exportar |
| **Pasaporte sanitario** | No existía | Página por mascota con QR, línea de tiempo, plan preventivo e impresión en PDF |
| **Calendario** | No existía | Calendario mensual con atenciones realizadas y dosis programadas o vencidas |
| **Mi perfil** | No existía | Editar datos propios, cambiar contraseña, información del token JWT y tabla de permisos |
| Alertas | No existían | Campana en la barra superior con dosis vencidas y próximas (30 días) |
| Formularios | Validación mínima | Validación en vivo igual a la del backend, sugerencia de próxima dosis, selector visual |
| Seguridad | JWT + roles en backend | Además: rutas protegidas por rol en React y aviso antes de que venza la sesión |
| Interfaz | Solo tema claro | Modo oscuro, diseño adaptable a celular, notificaciones tipo *toast* |
| Backend | CRUD | Validaciones de negocio, mensajes 400/409 claros, borrado en cascada, 2 controladores nuevos |

---

## 2. Backend (Spring Boot)

### 2.1 Endpoints nuevos

| Método | Ruta | Qué hace |
|--------|------|----------|
| GET | `/api/dashboard/resumen` | Totales, datos para las gráficas, alertas y actividad reciente. **Un DUEÑO solo recibe sus mascotas.** |
| GET | `/api/perfil` | Datos del usuario que tiene la sesión (lo identifica por el token, no por un id en la URL) |
| PUT | `/api/perfil` | Actualiza nombre, correo y teléfono propios |
| PUT | `/api/perfil/password` | Cambia la contraseña propia; exige la contraseña actual |

Archivos nuevos:

```
controlador/DashboardController.java   servicio/IDashboardService.java   servicio/DashboardService.java
controlador/PerfilController.java      servicio/IPerfilService.java      servicio/PerfilService.java
controlador/ManejadorErrores.java      seguridad/UsuarioAutenticado.java
```

### 2.2 Reglas de negocio agregadas

**Usuarios (`UsuarioService`)**
- Valida documento (5–20 caracteres), nombre, formato de correo, nombre de usuario, contraseña de mínimo 6 caracteres y rol válido → **400** con el motivo.
- No permite nombre de usuario **ni documento** repetidos, tampoco al editar → **409**.
- No permite eliminar un usuario que tiene mascotas → **409** "tiene N mascota(s)".
- No permite eliminar la propia cuenta, ni que un ADMIN se quite a sí mismo el rol ADMIN → **409**.

**Mascotas (`MascotaService`)**
- Nombre, especie y dueño obligatorios; edad entre 0 y 40; peso entre 0 y 200 kg; el dueño debe existir.
- **Eliminar una mascota borra también su historial médico en la misma transacción** (`@Transactional` + consulta `@Modifying`). Antes fallaba por la llave foránea.

**Eventos médicos (`EventoMedicoService`)**
- La fecha de aplicación no puede ser futura.
- La próxima dosis debe ser posterior a la fecha de aplicación.
- El listado general llega ordenado del más reciente al más antiguo (consulta JPQL `listarOrdenadosPorFecha`).

**`ManejadorErrores` (`@RestControllerAdvice`)**: un JSON mal formado o un id no numérico (`/api/mascotas/abc`) responde **400** con `{Mensaje, statusCode}` en lugar de la página de error de Spring.

### 2.3 Cómo se calculan las alertas de vacunación

Se usa la misma regla en `DashboardService.java` y en `utils/fechas.js`:

1. Se agrupan los eventos por **(mascota, tipo de evento)**.
2. De cada grupo solo cuenta el **más reciente**; los anteriores quedan como *RENOVADO*.
3. Del más reciente se mira la fecha de próxima dosis:
   - ya pasó → **VENCIDA**
   - faltan 30 días o menos → **PRÓXIMA**
   - más adelante → **AL DÍA**

Por eso, cuando se registra la vacuna que estaba vencida, la alerta desaparece sola.

---

## 3. Frontend (React)

### 3.1 Estructura nueva

```
src/
├── App.jsx                    ← rutas anidadas: PrivateRoute + Layout + <Outlet/>
├── hooks/
│   ├── useTabla.js            ← hook propio: búsqueda, filtros, orden y paginación
│   └── useClickFuera.js       ← cierra menús desplegables al hacer clic afuera
├── utils/
│   ├── fechas.js              ← fechas locales y estado sanitario de las dosis
│   ├── exportar.js            ← exportar a CSV compatible con Excel
│   ├── notificar.js           ← toasts y mensajes de error de SweetAlert2
│   ├── jwt.js                 ← lee el payload del token (vencimiento)
│   └── tema.js                ← modo claro / oscuro
├── services/
│   ├── DashboardService.js    ← GET /api/dashboard/resumen
│   └── PerfilService.js       ← /api/perfil
└── components/
    ├── Layout.jsx, Navbar.jsx, Dashboard.jsx
    ├── Pasaporte.jsx, Calendario.jsx, Perfil.jsx, NoEncontrado.jsx
    ├── (listas y formularios mejorados)
    └── comunes/  Paginacion, ColumnaOrdenable, EstadoDosis, Graficos,
                  Cargando, Vacio, CampoPassword, RequiereRol, VigilanteSesion
```

Única dependencia nueva: **`qrcode.react`** (código QR del pasaporte). Las gráficas están hechas con SVG y CSS, sin librerías.

### 3.2 Conceptos de React que se pueden explicar

| Concepto | Dónde verlo |
|----------|-------------|
| `useState`, `useEffect` | Todas las pantallas |
| `useMemo` (cálculos que no se repiten en cada render) | `MascotaList` (estado sanitario por mascota), `Calendario` |
| `useCallback` | Filtros que se pasan al hook `useTabla` |
| **Hook personalizado** | `hooks/useTabla.js` |
| `useRef` | `VigilanteSesion`, `Navbar` (menús desplegables) |
| `useParams`, `useSearchParams`, `useNavigate`, `useLocation` | `Pasaporte`, `EventoForm` (`?mascota=3&tipo=...`), `EventoList` (`?estado=VENCIDA`), `Navbar` |
| Rutas anidadas con `<Outlet />` | `App.jsx` + `Layout.jsx` |
| Protección de rutas por rol | `RequiereRol.jsx` |
| Peticiones en paralelo con Axios | `Promise.all([...])` en `Pasaporte`, `MascotaList`, `UsuarioList` |
| Componentes reutilizables con *props* | `comunes/*` |

---

## 4. Guion de demostración (unos 6 minutos)

> Antes de presentar, ejecute `database/datos_demo.sql` para tener datos con alertas reales.

1. **Login.** Mostrar el error en línea con una clave mala y luego entrar con el botón rápido **ADMIN**.
2. **Dashboard.** Indicadores, gráficas y alertas. Abrir la **campana** de la barra superior.
3. **Alerta → registrar dosis.** En la alerta de *Michi*, clic en la jeringa. El formulario abre con la mascota y el tipo ya elegidos y **sugiere la próxima dosis a 1 año**. Guardar. La app lleva al **pasaporte**, que ahora dice "al día", y la campana baja en 1.
4. **Pasaporte.** QR, plan preventivo, línea de tiempo e **Imprimir / PDF**.
5. **Historial médico.** Chips "Vencidas" y "Próximas", filtro por fechas, ordenar por columna, **Exportar** a Excel.
6. **Mascotas.** Cambiar a vista de **tarjetas**, filtrar por especie y eliminar una mascota (avisa cuántos eventos se borran).
7. **Usuarios.** Intentar borrar a un dueño con mascotas: el backend responde **409** y se muestra el motivo. Intentar crear un usuario con un nombre ya existente: también **409**.
8. **Calendario** del mes, con colores por tipo.
9. **Modo oscuro** (luna en la barra superior).
10. **Rol DUEÑO.** Cerrar sesión y entrar con el botón **DUENO**. No aparece *Usuarios*, solo se ven sus 3 mascotas y el dashboard dice "tus mascotas". Escribir `/usuarios` en la URL lo devuelve al panel.
11. **Mi perfil.** Cuenta regresiva del token JWT y tabla de permisos por rol.
12. *(Opcional)* **F12 → Network**: el encabezado `Authorization: Bearer ...` y las respuestas 400/409 del backend.

### Reparto sugerido

| Integrante | Funciones que explica |
|------------|----------------------|
| **Jhon** (Usuarios + Login/JWT) | Login, roles, `RequiereRol`, `VigilanteSesion`, Mi perfil y `PerfilController`, validaciones y 409 de usuarios |
| **David** (Mascotas) | Lista con tarjetas y filtros, hook `useTabla`, exportar, borrado en cascada, **Pasaporte con QR y PDF** |
| **Juan Diego** (Eventos) | Estados de las dosis, sugerencia de próxima dosis, **Dashboard** y `DashboardService`, alertas, **Calendario** |
