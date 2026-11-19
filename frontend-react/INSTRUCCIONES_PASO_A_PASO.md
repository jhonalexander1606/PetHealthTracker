# 🚀 Guía rápida — PetHealth Tracker React

**Tiempo total: 10–20 minutos** si ya tienes el backend corriendo del proyecto anterior.

---

## ✅ Antes de empezar

- [ ] **Node.js 18+** instalado (verifica con `node --version`). Si no, descarga en <https://nodejs.org>
- [ ] **El backend Spring Boot corriendo** en `http://localhost:8094` (el mismo que entregamos en octubre)
- [ ] **MySQL** con la BD `pethealthtracker` cargada (el script sigue siendo el mismo)

---

## 📥 Paso 1 — Descomprimir

Descomprime `PetHealthTracker-React.zip` en una ruta sin espacios ni tildes:

```
C:\Entornos\PetHealthTracker-React\
```

---

## 📦 Paso 2 — Instalar dependencias

Abre una terminal en la carpeta y ejecuta:

```bash
cd C:\Entornos\PetHealthTracker-React
npm install
```

Esto descarga unas 300 librerías (axios, react, bootstrap, etc.). Tarda 1-2 minutos.

---

## ▶️ Paso 3 — Arrancar el frontend

```bash
npm run dev
```

Se abre solo en <http://localhost:5173>. Deberías ver la pantalla de login.

Mientras tanto, **el backend debe estar corriendo** en NetBeans en el puerto 8094.

---

## 🔐 Paso 4 — Probar el login

Usa cualquiera de estas credenciales:

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admininicial` | `admin123456` | ADMIN |
| `davidmunoz` | `123456` | VETERINARIO |
| `jhoncalderon` | `123456` | DUENO |
| `juantellez` | `123456` | DUENO |

Verás el menú principal con 3 tarjetas: Usuarios, Mascotas, Eventos Médicos.

---

## 🧪 Paso 5 — Probar los CRUDs

### Como `admininicial` (ADMIN):
- Puedes **crear, editar y eliminar** usuarios.
- Puedes gestionar mascotas y eventos.

### Como `davidmunoz` (VETERINARIO) o `jhoncalderon` (DUENO):
- **No** puedes crear/editar/borrar usuarios (el backend lo bloquea con 403).
- Sí puedes gestionar mascotas y eventos médicos.

Prueba:
1. **Usuarios** → crear uno nuevo → guardar → aparece en la lista.
2. **Mascotas** → nueva mascota (ej. perro llamado "Rex", 2 años, dueño alguno) → guardar.
3. **Eventos Médicos** → nuevo evento → vacuna antirrábica para Rex el día de hoy, próxima dosis en un año → guardar.

Cada eliminación te pide confirmación con **SweetAlert2** (como lo muestra el PDF del profe).

---

## 🌐 Paso 6 — Desplegar a Vercel (link público, gratis, 2 min)

### 6.1 — Sube el proyecto a GitHub

Crea un nuevo repo en GitHub llamado `PetHealthTracker-React` (público).

Desde una terminal en la carpeta del proyecto:

```bash
git init
git add .
git commit -m "Frontend React + Axios - Entrega final"
git branch -M main
git remote add origin https://github.com/jhonalexander1606/PetHealthTracker-React.git
git push -u origin main
```

### 6.2 — Conectar Vercel

1. Entra a <https://vercel.com> → **Sign Up** con GitHub (gratis, no pide tarjeta).
2. Click en **Add New → Project**.
3. Selecciona el repo `PetHealthTracker-React`.
4. Vercel detecta Vite automáticamente. **No cambies nada.**
5. En **Environment Variables** agrega:
   - Name: `VITE_API_URL`
   - Value: `http://localhost:8094` (si el backend corre local) o la URL pública si lo despliegas.
6. Click en **Deploy**.
7. En ~2 minutos tienes una URL tipo `pethealth-tracker.vercel.app` 🎉

**⚠️ Importante:** si dejas `VITE_API_URL=http://localhost:8094`, el frontend desplegado solo funcionará mientras tu PC tenga el backend corriendo. Para la sustentación, abre NetBeans, arranca el backend, y luego abre el link de Vercel — así el profe ve el link público y el backend trabajando.

---

## 🩺 Paso 7 — Si algo falla

| Síntoma | Solución |
|---------|----------|
| `Network Error` en la consola del navegador | El backend no está corriendo. Arráncalo en NetBeans. |
| CORS error en la consola | Verifica que `SecurityConfig.java` tenga `setAllowedOriginPatterns("*")`. |
| `401 Unauthorized` al llamar endpoints | El token expiró. Haz logout y vuelve a iniciar sesión. |
| `npm install` falla | Borra `node_modules` y `package-lock.json`, vuelve a `npm install`. |
| Puerto 5173 ocupado | Vite usa el siguiente disponible (5174, 5175…). Lee la terminal. |
| El build de Vercel falla | Mira los logs. Casi siempre es porque faltó la variable `VITE_API_URL`. |

---

## 🎯 Para la sustentación

### Qué mostrar al profe
1. **El PDF del profe**: menciona que seguiste exactamente el stack que él recomienda (Vite + React + Axios + Bootstrap + React Router + Font Awesome + SweetAlert2).
2. **La estructura `services/`**: enseña `UsuarioService.js` con las funciones exportadas — es el patrón exacto del PDF página 5.
3. **El componente `UsuarioList.jsx`**: enseña `useState`, `useEffect`, `useNavigate` y `Swal.fire` — como la página 6 del PDF.
4. **La llamada Axios con JWT**: abre DevTools → Network → haz un POST de usuario → muestra el header `Authorization: Bearer <token>`.
5. **El link de Vercel**: si lograste desplegar, compártelo.

### Diferencias con el frontend viejo (si pregunta)
- Antes: HTML/CSS/JS puro con `XMLHttpRequest` (patrón `FrontEndProveedores.pdf`).
- Ahora: React + Axios (patrón `ConsumirApiRestconReactJSAxios.pdf`).
- Backend: el mismo, no cambió una línea. Es la ventaja de la arquitectura REST — el cliente puede ser cualquier cosa.

---

¡Éxitos! 🐶🐱
