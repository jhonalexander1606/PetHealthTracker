/* =====================================================================
 * PetHealth Tracker - CRUD de Mascotas (HU006)
 * ===================================================================== */

function loadData() {
    const request = sendRequest('api/mascotas/list', 'GET', '');
    const table = document.getElementById('mascota-table');
    table.innerHTML = '';

    request.onload = function () {
        let data = request.response;
        // Si el usuario es DUENO, solo ve sus propias mascotas
        if (getRol() === 'DUENO' && Array.isArray(data)) {
            const idUsuario = getIdUsuario();
            data = data.filter(function (m) {
                return m.usuario && m.usuario.id === idUsuario;
            });
        }
        if (!data || data.length === 0) {
            table.innerHTML = '<tr><td colspan="9" class="empty-state"><div class="icon"><i class="bi bi-inbox"></i></div>No hay mascotas registradas</td></tr>';
            return;
        }
        data.forEach(function (m) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${m.id}</td>
                <td><strong>${m.nombre}</strong></td>
                <td>${iconoEspecie(m.especie)} ${m.especie}</td>
                <td>${m.raza || '-'}</td>
                <td>${m.edad} ${m.edad === 1 ? 'ano' : 'anos'}</td>
                <td>${m.sexo || '-'}</td>
                <td>${m.peso ? m.peso + ' kg' : '-'}</td>
                <td>${m.usuario ? m.usuario.nombreCompleto + '<br><small class="text-muted"><i class="bi bi-telephone"></i> ' + (m.usuario.telefono || 'sin telefono') + '</small>' : '-'}</td>
                <td>
                    <div class="actions">
                        <button class="btn-sm-pet btn-edit" onclick="editarMascota(${m.id})" title="Editar"><i class="bi bi-pencil"></i></button>
                        <button class="btn-sm-pet btn-delete" onclick="eliminarMascota(${m.id})" title="Eliminar"><i class="bi bi-trash"></i></button>
                    </div>
                </td>
            `;
            table.appendChild(tr);
        });
    };

    request.onerror = function () {
        table.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Error al cargar las mascotas</td></tr>';
    };
}

function iconoEspecie(especie) {
    const map = {
        'Perro': '<i class="bi bi-emoji-smile"></i>',
        'Gato':  '<i class="bi bi-emoji-heart-eyes"></i>',
        'Ave':   '<i class="bi bi-feather"></i>',
        'Conejo':'<i class="bi bi-stars"></i>'
    };
    return map[especie] || '<i class="bi bi-github"></i>';
}

function editarMascota(id) {
    sessionStorage.setItem('mascotaEditar', id);
    window.location = 'form_mascotas.html';
}

function cargarMascotaParaEditar(id) {
    const request = sendRequest('api/mascotas/' + id, 'GET', '');
    request.onload = function () {
        const resp = request.response;
        if (resp && resp.Mascota) {
            const m = resp.Mascota;
            document.getElementById('mascota-id').value = m.id;
            document.getElementById('mascota-usuario').value = m.usuario ? m.usuario.id : '';
            document.getElementById('mascota-nombre').value = m.nombre;
            document.getElementById('mascota-especie').value = m.especie;
            document.getElementById('mascota-raza').value = m.raza || '';
            document.getElementById('mascota-edad').value = m.edad;
            document.getElementById('mascota-sexo').value = m.sexo || '';
            document.getElementById('mascota-peso').value = m.peso || '';
            document.getElementById('mascota-color').value = m.color || '';
        }
    };
}

function guardarMascota() {
    const id = document.getElementById('mascota-id').value;
    const idUsuario = document.getElementById('mascota-usuario').value;

    if (!idUsuario) { mostrarAlerta('Seleccione el dueno', 'danger'); return; }

    const mascota = {
        usuario: { id: parseInt(idUsuario) },
        nombre: document.getElementById('mascota-nombre').value.trim(),
        especie: document.getElementById('mascota-especie').value,
        raza: document.getElementById('mascota-raza').value.trim(),
        edad: parseInt(document.getElementById('mascota-edad').value),
        sexo: document.getElementById('mascota-sexo').value,
        peso: parseFloat(document.getElementById('mascota-peso').value) || null,
        color: document.getElementById('mascota-color').value.trim()
    };

    if (!mascota.nombre || !mascota.especie || isNaN(mascota.edad)) {
        mostrarAlerta('Complete los campos obligatorios', 'danger');
        return;
    }

    const endpoint = id ? 'api/mascotas/update/' + id : 'api/mascotas/save';
    const method = id ? 'PUT' : 'POST';
    const request = sendRequest(endpoint, method, mascota);

    request.onload = function () {
        if (request.status >= 200 && request.status < 300) {
            mostrarAlerta('Mascota guardada correctamente', 'success');
            sessionStorage.removeItem('mascotaEditar');
            setTimeout(function () { window.location = 'mascotas.html'; }, 1200);
        } else {
            const resp = request.response;
            mostrarAlerta((resp && resp.Mensaje) ? resp.Mensaje : 'Error al guardar', 'danger');
        }
    };
    request.onerror = function () {
        mostrarAlerta('Error de conexion con el servidor', 'danger');
    };
}

function eliminarMascota(id) {
    if (!confirm('Esta seguro de eliminar esta mascota? Se eliminaran tambien sus eventos medicos asociados.')) return;
    const request = sendRequest('api/mascotas/delete/' + id, 'DELETE', '');
    request.onload = function () {
        if (request.status >= 200 && request.status < 300) {
            mostrarAlerta('Mascota eliminada correctamente', 'success');
            loadData();
        } else {
            mostrarAlerta('Error al eliminar la mascota (puede tener eventos medicos asociados)', 'danger');
        }
    };
    request.onerror = function () {
        mostrarAlerta('Error de conexion', 'danger');
    };
}

function cargarUsuariosCombo() {
    const select = document.getElementById('mascota-usuario');

    // Si el usuario es DUENO, la mascota solo puede ser suya: se fija el dueno
    // en el mismo y se bloquea el selector para que no pueda reasignarla.
    if (getRol() === 'DUENO') {
        const u = getSesion();
        const opt = document.createElement('option');
        opt.value = u.idUsuario;
        opt.textContent = u.nombreCompleto;
        select.appendChild(opt);
        select.value = u.idUsuario;
        select.disabled = true;
        return;
    }

    // ADMIN y VETERINARIO pueden elegir cualquier dueno
    const request = sendRequest('api/usuarios/list', 'GET', '');
    request.onload = function () {
        const data = request.response || [];
        data.forEach(function (u) {
            const opt = document.createElement('option');
            opt.value = u.id;
            opt.textContent = u.nombreCompleto + ' (' + u.numeroDocumento + ')';
            select.appendChild(opt);
        });
    };
}

function mostrarAlerta(mensaje, tipo) {
    const box = document.getElementById('alertBox');
    if (!box) return;
    box.innerHTML = '<div class="alert-pet alert-' + tipo + '"><i class="bi bi-info-circle"></i> ' + mensaje + '</div>';
    setTimeout(function () { box.innerHTML = ''; }, 4000);
}
