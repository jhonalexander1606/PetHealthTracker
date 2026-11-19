package uis.edu.entorno.pethealth.servicio;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import uis.edu.entorno.pethealth.modelo.EventoMedico;
import uis.edu.entorno.pethealth.repositorio.EventoMedicoRepositorio;
import uis.edu.entorno.pethealth.repositorio.MascotaRepositorio;

/**
 * Implementacion del servicio de EventoMedico (vacunas, consultas, etc.).
 *
 * Reglas de negocio:
 *  - Mascota, tipo de evento y fecha de aplicacion son obligatorios.
 *  - La fecha de aplicacion no puede estar en el futuro (es algo que ya ocurrio).
 *  - La fecha de proxima dosis, si se informa, debe ser posterior a la de aplicacion.
 *  - El listado general se entrega del evento mas reciente al mas antiguo (RF-06).
 */
@Service
public class EventoMedicoService implements IEventoMedicoService {

    @Autowired
    private EventoMedicoRepositorio eventoMedicoRepositorio;

    @Autowired
    private MascotaRepositorio mascotaRepositorio;

    @Override
    public List<EventoMedico> listarTodos() {
        return eventoMedicoRepositorio.listarOrdenadosPorFecha();
    }

    @Override
    public ResponseEntity<?> buscarPorId(Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<EventoMedico> opt = eventoMedicoRepositorio.findById(id);
            if (opt.isEmpty()) {
                response.put("Mensaje", "Alerta: EventoMedico no encontrado");
                response.put("EventoMedico", null);
                response.put("statusCode", HttpStatus.NOT_FOUND.value());
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
            response.put("Mensaje", "Datos correctos");
            response.put("EventoMedico", opt.get());
            response.put("statusCode", HttpStatus.OK.value());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            response.put("Mensaje", "Ha ocurrido un error: " + e.getMessage());
            response.put("EventoMedico", null);
            response.put("statusCode", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> listarPorMascota(Integer idMascota) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (!mascotaRepositorio.existsById(idMascota)) {
                response.put("Mensaje", "Alerta: Mascota no encontrada");
                response.put("Eventos", null);
                response.put("statusCode", HttpStatus.NOT_FOUND.value());
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
            List<EventoMedico> lista = eventoMedicoRepositorio.findByIdMascota(idMascota);
            response.put("Mensaje", "Historial medico de la mascota " + idMascota);
            response.put("Eventos", lista);
            response.put("statusCode", HttpStatus.OK.value());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            response.put("Mensaje", "Ha ocurrido un error: " + e.getMessage());
            response.put("Eventos", null);
            response.put("statusCode", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> crear(EventoMedico evento) {
        Map<String, Object> response = new HashMap<>();
        try {
            String error = validar(evento);
            if (error != null) {
                return respuestaInvalida(response, error);
            }
            EventoMedico guardado = eventoMedicoRepositorio.save(evento);
            response.put("Mensaje", "Evento medico registrado correctamente");
            response.put("EventoMedico", guardado);
            response.put("statusCode", HttpStatus.CREATED.value());
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            response.put("Mensaje", "Error al registrar el evento: " + e.getMessage());
            response.put("EventoMedico", null);
            response.put("statusCode", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> actualizar(Integer id, EventoMedico evento) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<EventoMedico> opt = eventoMedicoRepositorio.findById(id);
            if (opt.isEmpty()) {
                response.put("Mensaje", "Alerta: EventoMedico no encontrado");
                response.put("EventoMedico", null);
                response.put("statusCode", HttpStatus.NOT_FOUND.value());
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }

            String error = validar(evento);
            if (error != null) {
                return respuestaInvalida(response, error);
            }

            EventoMedico existente = opt.get();
            existente.setMascota(evento.getMascota());
            existente.setTipoEvento(evento.getTipoEvento());
            existente.setFechaAplicacion(evento.getFechaAplicacion());
            existente.setVeterinariaClinica(evento.getVeterinariaClinica());
            existente.setVeterinario(evento.getVeterinario());
            existente.setNotasDiagnostico(evento.getNotasDiagnostico());
            existente.setFechaProximaDosis(evento.getFechaProximaDosis());

            EventoMedico actualizado = eventoMedicoRepositorio.save(existente);
            response.put("Mensaje", "EventoMedico actualizado correctamente");
            response.put("EventoMedico", actualizado);
            response.put("statusCode", HttpStatus.OK.value());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            response.put("Mensaje", "Error al actualizar: " + e.getMessage());
            response.put("EventoMedico", null);
            response.put("statusCode", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> eliminar(Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (!eventoMedicoRepositorio.existsById(id)) {
                response.put("Mensaje", "Alerta: EventoMedico no encontrado");
                response.put("statusCode", HttpStatus.NOT_FOUND.value());
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
            eventoMedicoRepositorio.deleteById(id);
            response.put("Mensaje", "EventoMedico eliminado correctamente");
            response.put("statusCode", HttpStatus.OK.value());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            response.put("Mensaje", "Error al eliminar: " + e.getMessage());
            response.put("statusCode", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ----- Validaciones de negocio -----

    /** Devuelve el motivo del error, o null si el evento es valido. */
    private String validar(EventoMedico e) {
        if (e == null) {
            return "No se recibieron los datos del evento";
        }
        if (e.getMascota() == null || e.getMascota().getId() == null) {
            return "Debe seleccionar la mascota";
        }
        if (!mascotaRepositorio.existsById(e.getMascota().getId())) {
            return "La mascota seleccionada no existe";
        }
        if (e.getTipoEvento() == null || e.getTipoEvento().isBlank()) {
            return "El tipo de evento es obligatorio";
        }
        if (e.getFechaAplicacion() == null) {
            return "La fecha de aplicacion es obligatoria";
        }
        if (e.getFechaAplicacion().isAfter(LocalDate.now())) {
            return "La fecha de aplicacion no puede estar en el futuro";
        }
        if (e.getFechaProximaDosis() != null
                && !e.getFechaProximaDosis().isAfter(e.getFechaAplicacion())) {
            return "La fecha de proxima dosis debe ser posterior a la fecha de aplicacion";
        }
        return null;
    }

    private ResponseEntity<?> respuestaInvalida(Map<String, Object> response, String mensaje) {
        response.put("Mensaje", mensaje);
        response.put("EventoMedico", null);
        response.put("statusCode", HttpStatus.BAD_REQUEST.value());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
}
