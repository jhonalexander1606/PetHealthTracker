/* =====================================================================
 * PetHealth Tracker - Login con JWT (HU001)
 *
 * Consume el endpoint POST /api/auth/login usando la API FETCH
 * (tecnologia distinta al XMLHttpRequest usado por el profesor).
 * Si las credenciales son correctas, guarda el token JWT y los datos
 * del usuario en sessionStorage y redirige al menu principal.
 * ===================================================================== */

function validarLogin() {
    const nombreUsuario = document.getElementById('nombreUsuario').value.trim();
    const password = document.getElementById('password').value.trim();

    ocultarError();

    if (!nombreUsuario || !password) {
        mostrarError('Por favor ingrese usuario y contrasena.');
        return;
    }

    const credenciales = { nombreUsuario: nombreUsuario, password: password };

    // ---- Consumo del login con FETCH ----
    fetch(url + 'api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credenciales)
    })
    .then(function (respuesta) {
        if (!respuesta.ok) {
            // 401 (credenciales incorrectas) u otro error
            throw new Error('credenciales');
        }
        return respuesta.json();
    })
    .then(function (data) {
        // data = { token, tipo, idUsuario, nombreUsuario, nombreCompleto, rol }
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('usuario', JSON.stringify({
            idUsuario: data.idUsuario,
            nombreUsuario: data.nombreUsuario,
            nombreCompleto: data.nombreCompleto,
            rol: data.rol
        }));
        window.location = 'menu.html';
    })
    .catch(function (error) {
        if (error.message === 'credenciales') {
            mostrarError('Usuario o contrasena incorrectos.');
        } else {
            mostrarError('Error de conexion con el servidor. Verifique que el backend este corriendo en http://localhost:8094');
        }
    });
}

function mostrarError(mensaje) {
    const errorBox = document.getElementById('errorBox');
    errorBox.innerHTML = '<i class="bi bi-exclamation-triangle"></i> ' + mensaje;
    errorBox.style.display = 'block';
}

function ocultarError() {
    const errorBox = document.getElementById('errorBox');
    errorBox.innerHTML = '';
    errorBox.style.display = 'none';
}

// Permitir login con Enter
document.addEventListener('DOMContentLoaded', function () {
    const inputs = document.querySelectorAll('#nombreUsuario, #password');
    inputs.forEach(function (input) {
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                validarLogin();
            }
        });
    });
});
