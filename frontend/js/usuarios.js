/* =====================================================================
 * PetHealth Tracker - CRUD de Usuarios (HU002, HU003, HU004, HU005)
 * ===================================================================== */

// ---------- LISTAR ----------
function loadData() {
    const request = sendRequest('api/usuarios/list', 'GET', '');
    const table = document.getElementById('usuario-table');
    table.innerHTML = '';

    request.onload = function () {
        const data = request.response;
        if (!data || data.length === 0) {
            table.innerHTML = '<tr><td colspan="7" class="empty-state"><div class="icon"><i class="bi bi-inbox"></i></div>No hay usuarios registrados</td></tr>';
            return;
        }
        data.forEach(function (u) { renderRow(u); });
    };

    request.onerror = function () {
        table.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error al cargar los usuarios. Verifique el backend.</td></tr>';
    };
}

function renderRow(u) {
    const table = document.getElementById('usuario-table');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${u.id}</td>
        <td><small class="text-muted">${u.tipoDocumento ? u.tipoDocumento.tipo : ''}</small><br>${u.numeroDocumento}</td>
        <td>${u.nombreCompleto}</td>
        <td>${u.email || ''}</td>
        <td>${u.telefono || '-'}</td>
        <td><code>${u.nombreUsuario}</code><br><span class="badge bg-secondary">${etiquetaRol(u.rol || 'DUENO')}</span></td>
        <td>
            <div class="actions">
                <button class="btn-sm-pet btn-edit" onclick="editarUsuario(${u.id})" title="Editar">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn-sm-pet btn-delete" onclick="eliminarUsuario(${u.id})" title="Eliminar">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </td>
    `;
    table.appendChild(tr);
}

// ---------- BUSCAR POR CEDULA (HU003) ----------
function buscarPorCedula() {
    const cedula = document.getElementById('buscarCedula').value.trim();
    if (!cedula) { loadData(); return; }

    const request = sendRequest('api/usuarios/cedula/' + cedula, 'GET', '');
    const table = document.getElementById('usuario-table');
    table.innerHTML = '';

    request.onload = function () {
        const data = request.response;
        if (data && data.Usuario) {
            renderRow(data.Usuario);
        } else {
            table.innerHTML = '<tr><td colspan="7" class="empty-state"><div class="icon"><i class="bi bi-search"></i></div>No se encontro ningun usuario con esa cedula</td></tr>';
        }
    };
    request.onerror = function () {
        table.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error al buscar</td></tr>';
    };
}

// ---------- EDITAR ----------
function editarUsuario(id) {
    sessionStorage.setItem('usuarioEditar', id);
    window.location = 'form_usuarios.html';
}

function cargarUsuarioParaEditar(id) {
    const request = sendRequest('api/usuarios/' + id, 'GET', '');
    request.onload = function () {
        const resp = request.response;
        if (resp && resp.Usuario) {
            const u = resp.Usuario;
            document.getElementById('usuario-id').value = u.id;
            document.getElementById('usuario-tipodoc').value = u.tipoDocumento ? u.tipoDocumento.id : '';
            document.getElementById('usuario-numdoc').value = u.numeroDocumento;
            document.getElementById('usuario-nombre').value = u.nombreCompleto;
            document.getElementById('usuario-email').value = u.email;
            document.getElementById('usuario-telefono').value = u.telefono || '';
            document.getElementById('usuario-user').value = u.nombreUsuario;
            document.getElementById('usuario-password').value = '';
            if (document.getElementById('usuario-rol')) {
                document.getElementById('usuario-rol').value = u.rol || 'DUENO';
            }
        }
    };
}

// ---------- GUARDAR (crear/actualizar) ----------
function guardarUsuario() {
    const id = document.getElementById('usuario-id').value;
    const idTipoDoc = document.getElementById('usuario-tipodoc').value;

    if (!idTipoDoc) { mostrarAlerta('Seleccione un tipo de documento', 'danger'); return; }

    const usuario = {
        tipoDocumento: { id: parseInt(idTipoDoc) },
        numeroDocumento: document.getElementById('usuario-numdoc').value.trim(),
        nombreCompleto: document.getElementById('usuario-nombre').value.trim(),
        email: document.getElementById('usuario-email').value.trim(),
        telefono: document.getElementById('usuario-telefono').value.trim(),
        nombreUsuario: document.getElementById('usuario-user').value.trim(),
        password: document.getElementById('usuario-password').value,
        rol: document.getElementById('usuario-rol') ? document.getElementById('usuario-rol').value : 'DUENO'
    };

    // Validaciones basicas
    if (!usuario.numeroDocumento || !usuario.nombreCompleto || !usuario.email || !usuario.nombreUsuario) {
        mostrarAlerta('Complete todos los campos obligatorios', 'danger');
        return;
    }
    if (!id && !usuario.password) {
        mostrarAlerta('La contrasena es obligatoria para usuarios nuevos', 'danger');
        return;
    }

    const endpoint = id ? 'api/usuarios/update/' + id : 'api/usuarios/save';
    const method = id ? 'PUT' : 'POST';
    const request = sendRequest(endpoint, method, usuario);

    request.onload = function () {
        const resp = request.response;
        if (request.status >= 200 && request.status < 300) {
            mostrarAlerta('Usuario guardado correctamente', 'success');
            sessionStorage.removeItem('usuarioEditar');
            setTimeout(function () { window.location = 'usuarios.html'; }, 1200);
        } else {
            mostrarAlerta((resp && resp.Mensaje) ? resp.Mensaje : 'Error al guardar', 'danger');
        }
    };
    request.onerror = function () {
        mostrarAlerta('Error de conexion con el servidor', 'danger');
    };
}

// ---------- ELIMINAR (HU005) ----------
function eliminarUsuario(id) {
    if (!confirm('Esta seguro de eliminar este usuario? Esta accion no se puede deshacer.')) return;
    const request = sendRequest('api/usuarios/delete/' + id, 'DELETE', '');
    request.onload = function () {
        if (request.status >= 200 && request.status < 300) {
            mostrarAlerta('Usuario eliminado correctamente', 'success');
            loadData();
        } else {
            mostrarAlerta('Error al eliminar el usuario', 'danger');
        }
    };
    request.onerror = function () {
        mostrarAlerta('Error de conexion', 'danger');
    };
}

// ---------- CARGAR TIPOS DE DOCUMENTO EN COMBO ----------
function cargarTiposDocumento() {
    const request = sendRequest('api/tipodocumento/list', 'GET', '');
    const select = document.getElementById('usuario-tipodoc');
    request.onload = function () {
        const data = request.response || [];
        data.forEach(function (t) {
            const opt = document.createElement('option');
            opt.value = t.id;
            opt.textContent = t.tipo;
            select.appendChild(opt);
        });
    };
}

// ---------- HELPERS ----------
function mostrarAlerta(mensaje, tipo) {
    const box = document.getElementById('alertBox');
    if (!box) return;
    box.innerHTML = '<div class="alert-pet alert-' + tipo + '"><i class="bi bi-info-circle"></i> ' + mensaje + '</div>';
    setTimeout(function () { box.innerHTML = ''; }, 4000);
}
