# PetHealth Tracker — Frontend React

> Frontend en **React + Vite** que consume la API REST de Spring Boot con **Axios**.
> Entrega final del curso **Entornos de Programación** — UIS 2026-II — Grupo 02.

Sigue al pie de la letra el patrón del PDF del profesor **"Consumo de API REST con ReactJS + AXIOS"**.

---

## 📦 Stack

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Bundler | **Vite** | 5.x |
| UI Library | **React** | 18.x |
| HTTP Client | **Axios** | 1.6.x |
| Enrutamiento | **React Router DOM** | 6.22.x |
| Estilos | **Bootstrap** | 5.3.x |
| Iconos | **Font Awesome** (free) | 6.5.x |
| Alertas | **SweetAlert2** | 11.x |
| Código QR | **qrcode.react** | 4.x |

El stack **coincide exactamente** con el que el profe listó en el PDF (Vite + React + Bootstrap + React Router DOM + Axios + Font Awesome + SweetAlert2).

---

## ✨ Funciones

Dashboard con gráficas y alertas, Pasaporte Sanitario con QR e impresión, calendario de vacunación, Mi perfil, búsqueda, filtros, orden, paginación y exportación en todas las tablas, modo oscuro y control de rol en las rutas. Ver [`../docs/FUNCIONES_AVANZADAS.md`](../docs/FUNCIONES_AVANZADAS.md).

## 🏗️ Estructura

```
src/
├── main.jsx                   ← entry point (importa Bootstrap + FontAwesome)
├── App.jsx                    ← BrowserRouter + Routes
├── styles.css                 ← estilos propios complemento Bootstrap
├── services/                  ← capa Axios (patrón del profe)
│   ├── axiosInstance.js       ← instancia Axios con interceptor JWT
│   ├── AuthService.js         ← POST /api/auth/login + manejo del token
│   ├── UsuarioService.js
│   ├── MascotaService.js
│   ├── EventoService.js
│   └── TipoDocumentoService.js
└── components/
    ├── Login.jsx              ← Pantalla de login con JWT
    ├── Layout.jsx + Navbar.jsx ← Plantilla comun, alertas, tema, menu de usuario
    ├── Dashboard.jsx          ← Panel con indicadores, graficas y alertas
    ├── Pasaporte.jsx          ← Pasaporte sanitario con QR e impresion
    ├── Calendario.jsx         ← Calendario de vacunacion
    ├── Perfil.jsx             ← Mi perfil, cambio de contrasena, sesion JWT
    ├── PrivateRoute.jsx       ← Protege rutas (requiere token)
    ├── comunes/               ← Paginacion, graficas, RequiereRol, VigilanteSesion...
    ├── UsuarioList.jsx + UsuarioForm.jsx   ← CRUD de Jhon
    ├── MascotaList.jsx + MascotaForm.jsx   ← CRUD de David
    └── EventoList.jsx + EventoForm.jsx     ← CRUD de Juan Diego
```

---

## 🚀 Instalación y uso local

### 1. Requisitos

- **Node.js 18+** (usa 20 LTS si puedes) — descarga en <https://nodejs.org>
- El **backend Spring Boot** corriendo en `http://localhost:8094` (ver repo `PetHealthTracker`)
- **MySQL/MariaDB** con la base `pethealthtracker` cargada

### 2. Instalar dependencias

```bash
cd PetHealthTracker-React
npm install
```

### 3. Configurar la URL del backend

Edita el archivo `.env` (o crea uno copiando `.env.example`):

```
VITE_API_URL=http://localhost:8094
```

Si despliegas el backend en Render/Railway, cambia aquí la URL pública.

### 4. Arrancar en modo desarrollo

```bash
npm run dev
```

Abre <http://localhost:5173> en el navegador.

### 5. Build para producción

```bash
npm run build
```

El bundle listo para desplegar queda en `dist/`.

---

## 🔐 Credenciales de prueba

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admininicial` | `admin123456` | **ADMIN** (único que puede crear/editar/borrar usuarios) |
| `davidmunoz` | `123456` | VETERINARIO |
| `jhoncalderon` | `123456` | DUENO |
| `juantellez` | `123456` | DUENO |

El login del backend devuelve un **JWT** que Axios adjunta automáticamente en cada petición (`Authorization: Bearer <token>`).

---

## ☁️ Despliegue en Vercel (1 click)

### Opción A — Desde la web (la más fácil)

1. Sube este proyecto a GitHub (por ejemplo, repo `PetHealthTracker-React`).
2. Entra a <https://vercel.com> → **Sign in with GitHub**.
3. Click en **Add New → Project** → selecciona el repo `PetHealthTracker-React`.
4. Vercel detecta Vite automáticamente. Deja todos los valores por defecto.
5. **IMPORTANTE:** antes de desplegar, en la sección **Environment Variables** agrega:
   - `VITE_API_URL` = `https://tu-backend-publico.com` (ver nota ⚠️ abajo)
6. Click en **Deploy**. En 2 minutos tienes tu URL tipo `pethealth-tracker.vercel.app`.

### Opción B — Desde la terminal

```bash
npm install -g vercel
vercel login
cd PetHealthTracker-React
vercel --prod
```

### ⚠️ Nota sobre `VITE_API_URL`

- Si **solo despliegas el frontend** y el backend queda en `localhost:8094` (tu PC), entonces **el link de Vercel solo funcionará en tu máquina** con el backend corriendo. Para la demo esto sirve.
- Para que **funcione desde cualquier parte**, necesitas desplegar el backend. Las opciones gratuitas son:
  - **Render.com** (Spring Boot) + **Aiven** o **Clever Cloud** (MySQL gratis)
  - **Railway.com** (todo en uno, requiere tarjeta)
- Si no tienes tiempo, lo más común en una entrega académica es: frontend desplegado en Vercel, backend corriendo local en la sustentación.

---

## 🔁 CORS

El backend ya tiene configurado CORS permisivo (`setAllowedOriginPatterns("*")`) en `SecurityConfig.java`, así que no necesitas cambiar nada.

Si el profe pide ser más estricto, puedes dejar solo tu dominio de Vercel:

```java
config.setAllowedOrigins(Arrays.asList(
    "http://localhost:5173",
    "https://pethealth-tracker.vercel.app"
));
```

---

## 📝 Patrón del profe implementado al pie de la letra

| Lo que pide el PDF | Dónde está en este proyecto |
|--------------------|------------------------------|
| `npm create vite@latest ... --template react` | ✅ Vite + React 18 configurado |
| `main.jsx` importa Bootstrap + FontAwesome | ✅ `src/main.jsx` |
| `App.jsx` con BrowserRouter + Routes | ✅ `src/App.jsx` |
| Carpeta `services/` con los Service.js | ✅ `src/services/` |
| Instancia axios con `const API_URL = '...'` | ✅ `axiosInstance.js` |
| `getXxx`, `getXxxById`, `saveXxx`, `updateXxx`, `deleteXxx` | ✅ en cada `*Service.js` |
| `XxxList.jsx` con useState + useEffect + useNavigate | ✅ `UsuarioList`, `MascotaList`, `EventoList` |
| `XxxForm.jsx` para crear y editar | ✅ `UsuarioForm`, `MascotaForm`, `EventoForm` |
| SweetAlert2 para confirmar eliminación | ✅ `Swal.fire({ ...showCancelButton })` |
| Botón "Nuevo" que navega a `/crear` | ✅ `navigate('/usuarios/crear')` |
| Botones "Editar" y "Eliminar" en cada fila | ✅ con `fa-edit` y `fa-trash` |

Adicionalmente agregamos:
- **JWT** con interceptor Axios (el profe no lo pedía, pero el backend lo requiere).
- **PrivateRoute** para proteger rutas que requieren sesión.
- **Control de rol** en el frontend (solo ADMIN ve el botón "Nuevo Usuario").

---

> Universidad Industrial de Santander · Escuela de Ingeniería de Sistemas e Informática · Grupo 02
