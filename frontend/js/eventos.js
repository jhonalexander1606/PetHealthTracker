/* =====================================================================
 * PetHealth Tracker - Historial Médico (HU007)
 *
 * La vista trabaja en dos niveles:
 *   VISTA 1: una fila por mascota (resumen: cuantos eventos, el ultimo,
 *            la proxima dosis).
 *   VISTA 2: el historial completo de UNA mascota, al entrar desde la vista 1.
 * ===================================================================== */

let mascotasResumen  = [];   // mascotas visibles segun el rol
let eventosTodos     = [];   // todos los eventos visibles segun el rol
let historialActual  = [];   // eventos de la mascota abierta (sin filtrar)

/* ==================== VISTA 1: RESUMEN POR MASCOTA ==================== */

function loadData() {
    // 1) Traer las mascotas
    const reqMascotas = sendRequest('api/mascotas/list', 'GET', '');

    reqMascotas.onload = function () {
        let mascotas = reqMascotas.response || [];
        // Un DUENO solo ve sus propias mascotas
        if (getRol() === 'DUENO') {
            const idUsuario = getIdUsuario();
            mascotas = mascotas.filter(function (m) {
                return m.usuario && m.usuario.id === idUsuario;
            });
        }
        mascotasResumen = mascotas;

        // 2) Traer los eventos para poder contarlos por mascota
        const reqEventos = sendRequest('api/eventos/list', 'GET', '');
        reqEventos.onload = function () {
            let eventos = reqEventos.response || [];
            if (getRol() === 'DUENO') {
                const idUsuario = getIdUsuario();
                eventos = eventos.filter(function (e) {
                    return e.mascota && e.mascota.usuario && e.mascota.usuario.id === idUsuario;
                });
            }
            eventosTodos = eventos;
            renderResumen(mascotasResumen);

            // Si venimos de guardar un evento, volver directo al historial
            if (sessionStorage.getItem('volverAlHistorial')) {
                sessionStorage.removeItem('volverAlHistorial');
                const idM = sessionStorage.getItem('mascotaHistorial');
                if (idM) verHistorial(parseInt(idM));
            }
        };
        reqEventos.onerror = function () {
            document.getElementById('resumen-table').innerHTML =
                '<tr><td colspan="7" class="text-center text-danger">Error al cargar los eventos</td></tr>';
        };
    };

    reqMascotas.onerror = function () {
        document.getElementById('resumen-table').innerHTML =
            '<tr><td colspan="7" class="text-center text-danger">Error al cargar las mascotas</td></tr>';
    };
}

// Devuelve los eventos de una mascota concreta
function eventosDe(idMascota) {
    return eventosTodos.filter(function (e) {
        return e.mascota && e.mascota.id === idMascota;
    });
}

// Pinta la tabla resumen: una fila por mascota
function renderResumen(lista) {
    const table = document.getElementById('resumen-table');
    table.innerHTML = '';

    if (!lista || lista.length === 0) {
        table.innerHTML = '<tr><td colspan="7" class="empty-state"><div class="icon"><i class="bi bi-inbox"></i></div>No hay mascotas registradas</td></tr>';
        return;
    }

    lista.forEach(function (m) {
        const suyos = eventosDe(m.id);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${m.nombre}</strong></td>
            <td>${iconoEspecieEv(m.especie)} ${m.especie}</td>
            <td>${m.usuario ? m.usuario.nombreCompleto : '-'}</td>
            <td><span class="badge bg-secondary">${suyos.length}</span></td>
            <td>${ultimoEvento(suyos)}</td>
            <td>${proximaDosis(suyos)}</td>
            <td>
                <button class="btn-secondary-pet" onclick="verHistorial(${m.id})">
                    <i class="bi bi-clipboard2-pulse"></i> Ver historial
                </button>
            </td>
        `;
        table.appendChild(tr);
    });
}

// Texto del ultimo evento aplicado
function ultimoEvento(eventos) {
    if (!eventos || eventos.length === 0) {
        return '<span class="text-muted">Sin eventos</span>';
    }
    const ordenados = eventos.slice().sort(function (a, b) {
        return (b.fechaAplicacion || '').localeCompare(a.fechaAplicacion || '');
    });
    const u = ordenados[0];
    return `<span class="${badgeClase(u.tipoEvento)}">${u.tipoEvento}</span>
            <br><small class="text-muted">${formatearFecha(u.fechaAplicacion)}</small>`;
}

// Próxima dosis pendiente (o la ultima vencida, en rojo)
function proximaDosis(eventos) {
    const fechas = (eventos || [])
        .filter(function (e) { return e.fechaProximaDosis; })
        .map(function (e) { return e.fechaProximaDosis; })
        .sort();

    if (fechas.length === 0) return '<span class="text-muted">-</span>';

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const futuras = fechas.filter(function (f) {
        return new Date(f + 'T00:00:00') >= hoy;
    });

    if (futuras.length > 0) {
        return '<i class="bi bi-bell"></i> ' + formatearFecha(futuras[0]);
    }
    return '<span style="color:#c0392b;"><i class="bi bi-exclamation-triangle"></i> ' +
           formatearFecha(fechas[fechas.length - 1]) + ' (vencida)</span>';
}

function iconoEspecieEv(especie) {
    const map = {
        'Perro': '<i class="bi bi-emoji-smile"></i>',
        'Gato':  '<i class="bi bi-emoji-heart-eyes"></i>',
        'Ave':   '<i class="bi bi-feather"></i>',
        'Conejo':'<i class="bi bi-stars"></i>'
    };
    return map[especie] || '<i class="bi bi-github"></i>';
}

// Buscador de la vista 1: por nombre de mascota, especie o dueño
function buscarResumen() {
    const texto = document.getElementById('buscarMascotaHist').value.trim().toLowerCase();
    if (!texto) { renderResumen(mascotasResumen); return; }

    const filtradas = mascotasResumen.filter(function (m) {
        return (m.nombre && m.nombre.toLowerCase().includes(texto)) ||
               (m.especie && m.especie.toLowerCase().includes(texto)) ||
               (m.usuario && m.usuario.nombreCompleto &&
                m.usuario.nombreCompleto.toLowerCase().includes(texto));
    });
    renderResumen(filtradas);
}

/* ==================== VISTA 2: HISTORIAL DE UNA MASCOTA ==================== */

function verHistorial(idMascota) {
    const mascota = mascotasResumen.find(function (m) { return m.id === idMascota; });
    if (!mascota) return;

    // Se recuerda cual mascota se esta viendo (para volver y para el formulario)
    sessionStorage.setItem('mascotaHistorial', idMascota);

    document.getElementById('historial-titulo').textContent = 'Historial de ' + mascota.nombre;
    document.getElementById('historial-subtitulo').innerHTML =
        `${mascota.especie}${mascota.raza ? ' - ' + mascota.raza : ''} &middot; ` +
        `Due\u00f1o: ${mascota.usuario ? mascota.usuario.nombreCompleto : '-'}` +
        `${mascota.usuario && mascota.usuario.telefono ? ' (' + mascota.usuario.telefono + ')' : ''}`;

    document.getElementById('vista-mascotas').style.display = 'none';
    document.getElementById('vista-historial').style.display = 'block';

    // Se consulta el endpoint dedicado del backend (viene ordenado por fecha)
    const request = sendRequest('api/eventos/mascota/' + idMascota, 'GET', '');
    request.onload = function () {
        const resp = request.response;
        historialActual = (resp && resp.Eventos) ? resp.Eventos : [];
        limpiarFiltroFechas();   // muestra todo y deja los filtros en blanco
    };
    request.onerror = function () {
        document.getElementById('historial-table').innerHTML =
            '<tr><td colspan="8" class="text-center text-danger">Error al cargar el historial</td></tr>';
    };
}

/* ---------- Filtro por rango de fechas (sobre fechaAplicacion) ---------- */

function hayFiltroActivo() {
    const d = document.getElementById('filtroDesde');
    const h = document.getElementById('filtroHasta');
    return (d && d.value) || (h && h.value);
}

function filtrarHistorial() {
    const desde = document.getElementById('filtroDesde').value;
    const hasta = document.getElementById('filtroHasta').value;

    if (desde && hasta && desde > hasta) {
        mostrarAlerta('La fecha "Desde" no puede ser posterior a la fecha "Hasta"', 'danger');
    }

    // Las fechas vienen como "2026-01-15", asi que se pueden comparar como texto
    let lista = historialActual.filter(function (e) {
        if (!e.fechaAplicacion) return false;
        if (desde && e.fechaAplicacion < desde) return false;
        if (hasta && e.fechaAplicacion > hasta) return false;
        return true;
    });

    renderHistorial(lista);
    actualizarContador(lista.length, historialActual.length);
}

// Atajo: los eventos del ultimo ano
function filtroUltimoAnio() {
    const hoy = new Date();
    const haceUnAnio = new Date();
    haceUnAnio.setFullYear(hoy.getFullYear() - 1);

    document.getElementById('filtroDesde').value = aISO(haceUnAnio);
    document.getElementById('filtroHasta').value = aISO(hoy);
    filtrarHistorial();
}

function limpiarFiltroFechas() {
    const d = document.getElementById('filtroDesde');
    const h = document.getElementById('filtroHasta');
    if (d) d.value = '';
    if (h) h.value = '';
    renderHistorial(historialActual);
    actualizarContador(historialActual.length, historialActual.length);
}

function actualizarContador(mostrados, total) {
    const span = document.getElementById('contadorHistorial');
    if (!span) return;
    span.textContent = (mostrados === total)
        ? total + (total === 1 ? ' evento' : ' eventos')
        : 'Mostrando ' + mostrados + ' de ' + total + ' eventos';
}

// Convierte un objeto Date a texto "yyyy-mm-dd" (lo que espera un input date)
function aISO(fecha) {
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return fecha.getFullYear() + '-' + mes + '-' + dia;
}

function renderHistorial(lista) {
    const table = document.getElementById('historial-table');
    table.innerHTML = '';

    if (!lista || lista.length === 0) {
        const mensaje = hayFiltroActivo()
            ? 'No hay eventos médicos en el rango de fechas seleccionado'
            : 'Esta mascota aún no tiene eventos médicos registrados';
        table.innerHTML = '<tr><td colspan="8" class="empty-state"><div class="icon"><i class="bi bi-clipboard2-x"></i></div>' + mensaje + '</td></tr>';
        return;
    }

    lista.forEach(function (e) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${e.id}</td>
            <td><span class="${badgeClase(e.tipoEvento)}">${e.tipoEvento}</span></td>
            <td>${formatearFecha(e.fechaAplicacion)}</td>
            <td>${e.veterinariaClinica || '-'}</td>
            <td>${e.veterinario || '-'}</td>
            <td><small>${e.notasDiagnostico || '-'}</small></td>
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

function volverAMascotas() {
    sessionStorage.removeItem('mascotaHistorial');
    document.getElementById('vista-historial').style.display = 'none';
    document.getElementById('vista-mascotas').style.display = 'block';
    loadData();   // refresca los contadores por si hubo cambios
}

/* ==================== NAVEGACION HACIA EL FORMULARIO ==================== */

// "Nuevo Evento" desde el historial de una mascota -> la deja preseleccionada
function nuevoEventoParaMascota() {
    sessionStorage.removeItem('eventoEditar');
    sessionStorage.setItem('volverAlHistorial', '1');
    window.location = 'form_eventos.html';
}

// "Nuevo Evento" desde el resumen -> sin mascota preseleccionada
function nuevoEventoGeneral() {
    sessionStorage.removeItem('eventoEditar');
    sessionStorage.removeItem('mascotaHistorial');
    sessionStorage.removeItem('volverAlHistorial');
    window.location = 'form_eventos.html';
}

function editarEvento(id) {
    sessionStorage.setItem('eventoEditar', id);
    sessionStorage.setItem('volverAlHistorial', '1');
    window.location = 'form_eventos.html';
}

function eliminarEvento(id) {
    if (!confirm('¿Está seguro de eliminar este evento médico?')) return;
    const request = sendRequest('api/eventos/delete/' + id, 'DELETE', '');
    request.onload = function () {
        if (request.status >= 200 && request.status < 300) {
            mostrarAlerta('Evento eliminado correctamente', 'success');
            // Recargar el historial de la mascota que se esta viendo
            const idM = sessionStorage.getItem('mascotaHistorial');
            const reqEv = sendRequest('api/eventos/list', 'GET', '');
            reqEv.onload = function () {
                eventosTodos = reqEv.response || [];
                if (idM) verHistorial(parseInt(idM));
            };
        } else {
            mostrarAlerta('Error al eliminar el evento', 'danger');
        }
    };
    request.onerror = function () { mostrarAlerta('Error de conexión', 'danger'); };
}

/* ==================== FORMULARIO (form_eventos.html) ==================== */

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
            // Al volver, se abre el historial de la mascota del evento
            sessionStorage.setItem('mascotaHistorial', idMascota);
            sessionStorage.setItem('volverAlHistorial', '1');
            setTimeout(function () { window.location = 'eventos.html'; }, 1200);
        } else {
            const resp = request.response;
            mostrarAlerta((resp && resp.Mensaje) ? resp.Mensaje : 'Error al guardar', 'danger');
        }
    };
    request.onerror = function () {
        mostrarAlerta('Error de conexión con el servidor', 'danger');
    };
}

// Llena el combo de mascotas del formulario
function cargarMascotasCombo() {
    const request = sendRequest('api/mascotas/list', 'GET', '');
    const select = document.getElementById('evento-mascota');

    request.onload = function () {
        let data = request.response || [];
        // Un DUENO solo puede registrar eventos de sus propias mascotas
        if (getRol() === 'DUENO') {
            const idUsuario = getIdUsuario();
            data = data.filter(function (m) {
                return m.usuario && m.usuario.id === idUsuario;
            });
        }
        data.forEach(function (m) {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = m.nombre + ' (' + m.especie + ')' +
                              (m.usuario ? ' - ' + m.usuario.nombreCompleto : '');
            select.appendChild(opt);
        });

        // Si venimos del historial de una mascota, queda preseleccionada
        const idPre = sessionStorage.getItem('mascotaHistorial');
        if (idPre && !sessionStorage.getItem('eventoEditar')) {
            select.value = idPre;
        }
    };
}

/* ==================== HELPERS ==================== */

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
        // Las fechas llegan como "2026-01-15". Se les agrega la hora local para
        // que el navegador no las interprete en UTC y muestre un dia menos.
        const texto = (fecha.length === 10) ? fecha + 'T00:00:00' : fecha;
        const d = new Date(texto);
        if (isNaN(d.getTime())) return fecha;
        return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
        return fecha;
    }
}

function mostrarAlerta(mensaje, tipo) {
    // Escribe en la caja de alertas de la vista que este visible
    let box = document.getElementById('alertBoxHistorial');
    const vistaHist = document.getElementById('vista-historial');
    if (!box || !vistaHist || vistaHist.style.display === 'none') {
        box = document.getElementById('alertBox');
    }
    if (!box) return;
    box.innerHTML = '<div class="alert-pet alert-' + tipo + '"><i class="bi bi-info-circle"></i> ' + mensaje + '</div>';
    setTimeout(function () { box.innerHTML = ''; }, 4000);
}
