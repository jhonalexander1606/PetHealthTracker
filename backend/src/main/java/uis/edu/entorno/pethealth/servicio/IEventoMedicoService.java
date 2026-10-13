package uis.edu.entorno.pethealth.servicio;

import java.util.List;

import org.springframework.http.ResponseEntity;

import uis.edu.entorno.pethealth.modelo.EventoMedico;

/**
 * Interfaz del servicio de EventoMedico.
 */
public interface IEventoMedicoService {

    List<EventoMedico> listarTodos();

    ResponseEntity<?> buscarPorId(Integer id);

    ResponseEntity<?> listarPorMascota(Integer idMascota);

    ResponseEntity<?> crear(EventoMedico evento);

    ResponseEntity<?> actualizar(Integer id, EventoMedico evento);

    ResponseEntity<?> eliminar(Integer id);
}
