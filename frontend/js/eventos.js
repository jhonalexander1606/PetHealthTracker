/* =====================================================================
 * PetHealth Tracker - CRUD de Eventos Medicos (HU007)
 * ===================================================================== */

// Guarda los eventos cargados (ya filtrados por rol) para poder buscar sobre ellos
let eventosActuales = [];

function loadData() {
    const request = sendRequest('api/eventos/list', 'GET', '');

    request.onload = function () {
        let data = request.response;
        // Si el usuario es DUENO, solo ve los eventos de sus propias mascotas
        if (getRol() === 'DUENO' && Array.isArray(data)) {
            const idUsuario = getIdUsuario();
            data = data.filter(function (e) {
                return e.mascota && e.mascota.usuario && e.mascota.usuario.id === idUsuario;
            });
        }
        eventosActuales = data || [];
        renderEventos(eventosActuales);
    };

    request.onerror = function () {
        document.getElementById('evento-table').innerHTML =
            '<tr><td colspan="8" class="text-center text-danger">Error al cargar los eventos</td></tr>';
    };
}

// Pinta una lista de eventos en la tabla
function renderEventos(lista) {
    const table = document.getElementById('evento-table');
    table.innerHTML = '';

    if (!lista || lista.length === 0) {
        table.innerHTML = '<tr><td colspan="8" class="empty-state"><div class="icon"><i class="bi bi-inbox"></i></div>No hay eventos medicos registrados</td></tr>';
        return;
    }
    lista.forEach(function (e) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${e.id}</td>
            <td>${e.mascota ? '<strong>' + e.mascota.nombre + '</strong><br><small class="text-muted">' + e.mascota.especie + '</small>' : '-'}</td>
            <td><span class="${badgeClase(e.tipoEvento)}">${e.tipoEvento}</span></td>
            <td>${formatearFecha(e.fechaAplicacion)}</td>
            <td>${e.veterinariaClinica || '-'}</td>
            <td>${e.veterinario || '-'}</td>
            <td>${e.fechaProximaDosis ? '<i class="bi bi-bell"></i> ' + formatearFecha(e.fechaProximaDosis) : '-'}</td>
            <td>
                <div class="actions">
                    <button class="btn-sm-pet btn-edit" onclick="editarEvento(${e.id})" title="Editar"><i class="bi bi-pencil"></i></button>
                    <button class="btn-sm-pet btn-delete" onclick="eliminarEvento(${e.id})" title="Eliminar"><i class="bi bi-trash"></i></button>
                </div>
            </td>
        `;
        table.appendChild(tr);
    });
}

// Busca (filtra) por mascota o tipo de evento sobre los eventos ya cargados
function buscarEvento() {
    const texto = document.getElementById('buscarEvento').value.trim().toLowerCase();
    if (!texto) {
        renderEventos(eventosActuales);
        return;
    }
    const filtrados = eventosActuales.filter(function (e) {
        return (e.mascota && e.mascota.nombre && e.mascota.nombre.toLowerCase().includes(texto)) ||
               (e.tipoEvento && e.tipoEvento.toLowerCase().includes(texto));
    });
    renderEventos(filtrados);
}

function badgeClase(tipo) {
    if (!tipo) return 'badge-event';
    if (tipo.includes('VACUNA')) return 'badge-event badge-vaccine';
    if (tipo.includes('CONSULTA')) return 'badge-event badge-consult';
    if (tipo.includes('DESPARASITACION')) return 'badge-event badge-deworm';
    if (tipo.includes('CIRUGIA') || tipo.includes('ESTERILIZACION')) return 'badge-event badge-surgery';
    return 'badge-event';
}

function formatearFecha(fecha) {
    if (!fecha) return '-';
    try {
        const d = new Date(fecha);
        return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
        return fecha;
    }
}

function editarEvento(id) {
    sessionStorage.setItem('eventoEditar', id);
    window.location = 'form_eventos.html';
}

function cargarEventoParaEditar(id) {
    const request = sendRequest('api/eventos/' + id, 'GET', '');
    request.onload = function () {
        const resp = request.response;
        if (resp && resp.EventoMedico) {
            const e = resp.EventoMedico;
            document.getElementById('evento-id').value = e.id;
            document.getElementById('evento-mascota').value = e.mascota ? e.mascota.id : '';
            document.getElementById('evento-tipo').value = e.tipoEvento;
            document.getElementById('evento-fecha').value = e.fechaAplicacion;
            document.getElementById('evento-proxima').value = e.fechaProximaDosis || '';
            document.getElementById('evento-clinica').value = e.veterinariaClinica || '';
            document.getElementById('evento-veterinario').value = e.veterinario || '';
            document.getElementById('evento-notas').value = e.notasDiagnostico || '';
        }
    };
}

function guardarEvento() {
    const id = document.getElementById('evento-id').value;
    const idMascota = document.getElementById('evento-mascota').value;

    if (!idMascota) { mostrarAlerta('Seleccione la mascota', 'danger'); return; }

    const evento = {
        mascota: { id: parseInt(idMascota) },
        tipoEvento: document.getElementById('evento-tipo').value,
        fechaAplicacion: document.getElementById('evento-fecha').value,
        fechaProximaDosis: document.getElementById('evento-proxima').value || null,
        veterinariaClinica: document.getElementById('evento-clinica').value.trim(),
        veterinario: document.getElementById('evento-veterinario').value.trim(),
        notasDiagnostico: document.getElementById('evento-notas').value.trim()
    };

    if (!evento.tipoEvento || !evento.fechaAplicacion) {
        mostrarAlerta('Complete los campos obligatorios', 'danger');
        return;
    }

    const endpoint = id ? 'api/eventos/update/' + id : 'api/eventos/save';
    const method = id ? 'PUT' : 'POST';
    const request = sendRequest(endpoint, method, evento);

    request.onload = function () {
        if (request.status >= 200 && request.status < 300) {
            mostrarAlerta('Evento guardado correctamente', 'success');
            sessionStorage.removeItem('eventoEditar');
            setTimeout(function () { window.location = 'eventos.html'; }, 1200);
        } else {
            const resp = request.response;
            mostrarAlerta((resp && resp.Mensaje) ? resp.Mensaje : 'Error al guardar', 'danger');
        }
    };
    request.onerror = function () {
        mostrarAlerta('Error de conexion con el servidor', 'danger');
    };
}

function eliminarEvento(id) {
    if (!confirm('Esta seguro de eliminar este evento medico?')) return;
    const request = sendRequest('api/eventos/delete/' + id, 'DELETE', '');
    request.onload = function () {
        if (request.status >= 200 && request.status < 300) {
            mostrarAlerta('Evento eliminado correctamente', 'success');
            loadData();
        } else {
            mostrarAlerta('Error al eliminar el evento', 'danger');
        }
    };
    request.onerror = function () {
        mostrarAlerta('Error de conexion', 'danger');
    };
}

function cargarMascotasCombo() {
    const request = sendRequest('api/mascotas/list', 'GET', '');
    const select = document.getElementById('evento-mascota');
    request.onload = function () {
        const data = request.response || [];
        data.forEach(function (m) {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = m.nombre + ' (' + m.especie + ')' + (m.usuario ? ' - ' + m.usuario.nombreCompleto : '');
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
