package uis.edu.entorno.pethealth.servicio;

import java.util.List;

import org.springframework.http.ResponseEntity;

import uis.edu.entorno.pethealth.modelo.Mascota;

/**
 * Interfaz del servicio de Mascota.
 */
public interface IMascotaService {

    List<Mascota> listarTodas();

    ResponseEntity<?> buscarPorId(Integer id);

    ResponseEntity<?> listarPorUsuario(Integer idUsuario);

    ResponseEntity<?> crear(Mascota mascota);

    ResponseEntity<?> actualizar(Integer id, Mascota mascota);

    ResponseEntity<?> eliminar(Integer id);
}
