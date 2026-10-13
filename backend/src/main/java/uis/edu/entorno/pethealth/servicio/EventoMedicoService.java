package uis.edu.entorno.pethealth.servicio;

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

/**
 * Implementacion del servicio de EventoMedico (vacunas, consultas, etc.).
 */
@Service
public class EventoMedicoService implements IEventoMedicoService {

    @Autowired
    private EventoMedicoRepositorio eventoMedicoRepositorio;

    @Override
    public List<EventoMedico> listarTodos() {
        return eventoMedicoRepositorio.findAll();
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
}
