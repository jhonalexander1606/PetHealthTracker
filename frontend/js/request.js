/* =====================================================================
 * PetHealth Tracker - Helper AJAX + gestion de sesion JWT
 *
 * - sendRequest(): envia peticiones al backend agregando siempre el token
 *   JWT en la cabecera "Authorization: Bearer <token>".
 * - Funciones de sesion para leer el token, el rol y el usuario logueado.
 * - Guard automatico: si una pagina protegida se abre sin token, redirige
 *   al login (index.html).
 * - Pinta en la barra superior el nombre y el rol del usuario, y oculta el
 *   menu de Usuarios a quien no sea administrador (en todas las vistas).
 * ===================================================================== */

// URL base del microservicio Spring Boot
const url = "http://localhost:8094/";

/* ---------- Gestion de la sesion (sessionStorage) ---------- */

function getToken() {
    return sessionStorage.getItem('token');
}

function getSesion() {
    const s = sessionStorage.getItem('usuario');
    return s ? JSON.parse(s) : null;
}

function getRol() {
    const u = getSesion();
    return u ? u.rol : null;
}

function getIdUsuario() {
    const u = getSesion();
    return u ? u.idUsuario : null;
}

function cerrarSesion() {
    sessionStorage.clear();
    window.location = 'index.html';
}

/**
 * Devuelve la etiqueta "bonita" de un rol para mostrar en pantalla.
 * OJO: el valor guardado en la BD y en el codigo siempre es DUENO/VETERINARIO/ADMIN.
 */
function etiquetaRol(rol) {
    switch (rol) {
        case 'ADMIN':       return 'Administrador';
        case 'VETERINARIO': return 'Veterinario';
        case 'DUENO':       return 'Dueño';
        default:            return rol || '';
    }
}

/* ---------- Guard de paginas protegidas ----------
 * Si la pagina NO es el login (index.html) y no hay token, redirige al login.
 */
(function protegerPagina() {
    const ruta = window.location.pathname;
    const esLogin = ruta.endsWith('index.html') || ruta.endsWith('/') || ruta === '';
    if (!esLogin && !getToken()) {
        window.location = 'index.html';
    }
})();

/* ---------- Barra superior: nombre, rol y visibilidad de Usuarios ----------
 * Se ejecuta en todas las vistas (request.js esta incluido en todas).
 */
function pintarNavbar() {
    const u = getSesion();
    if (!u) return;

    // 1. El modulo "Usuarios" solo lo ve el ADMIN (en cualquier vista)
    if (u.rol !== 'ADMIN') {
        document.querySelectorAll('a[href="usuarios.html"]').forEach(function (a) {
            const li = a.closest('li');     // enlace del menu
            if (li) {
                li.style.display = 'none';
            } else {
                a.style.display = 'none';   // tarjeta del panel principal
            }
        });
        const card = document.getElementById('card-usuarios');
        if (card) card.style.display = 'none';
    }

    // 2. Mostrar nombre + rol en la barra superior
    const texto = '<i class="bi bi-person-circle"></i> ' +
                  (u.nombreCompleto || u.nombreUsuario) +
                  ' <span class="badge bg-light text-dark">' + etiquetaRol(u.rol) + '</span>';

    let info = document.getElementById('userInfo');
    if (info) {
        info.innerHTML = texto;
    } else {
        // Si la vista no tiene el span, se crea antes del boton "Salir"
        const btn = document.querySelector('.btn-logout');
        if (btn) {
            const span = document.createElement('span');
            span.id = 'userInfo';
            span.className = 'user-info';
            span.style.color = '#ffffff';
            span.style.marginRight = '15px';
            span.innerHTML = texto;
            btn.parentNode.insertBefore(span, btn);
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', pintarNavbar);
} else {
    pintarNavbar();
}

/* ---------- Helper de peticiones ---------- */

/**
 * Envia una peticion HTTP al backend incluyendo el token JWT.
 * @param {string} endPoint - ruta despues de la URL base (ej: "api/usuarios/list")
 * @param {string} method   - metodo HTTP ("GET", "POST", "PUT", "DELETE")
 * @param {object|string} data - datos a enviar (o string vacio)
 * @returns XMLHttpRequest
 */
function sendRequest(endPoint, method, data) {
    let request = new XMLHttpRequest();
    request.open(method, url + endPoint);
    request.responseType = 'json';
    request.setRequestHeader('Content-Type', 'application/json');

    // Se agrega el token JWT si existe (para los endpoints protegidos)
    const token = getToken();
    if (token) {
        request.setRequestHeader('Authorization', 'Bearer ' + token);
    }

    // Si el backend responde 401/403, la sesion no es valida: volver al login
    request.addEventListener('load', function () {
        if (request.status === 401 || request.status === 403) {
            alert('Su sesion expiro o no tiene permisos. Inicie sesion nuevamente.');
            cerrarSesion();
        }
    });

    request.send(data ? JSON.stringify(data) : data);
    return request;
}
