package uis.edu.entorno.pethealth.servicio;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import uis.edu.entorno.pethealth.modelo.Mascota;
import uis.edu.entorno.pethealth.repositorio.MascotaRepositorio;

/**
 * Implementacion del servicio de Mascota.
 */
@Service
public class MascotaService implements IMascotaService {

    @Autowired
    private MascotaRepositorio mascotaRepositorio;

    @Override
    public List<Mascota> listarTodas() {
        return mascotaRepositorio.findAll();
    }

    @Override
    public ResponseEntity<?> buscarPorId(Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<Mascota> opt = mascotaRepositorio.findById(id);
            if (opt.isEmpty()) {
                response.put("Mensaje", "Alerta: Mascota no encontrada");
                response.put("Mascota", null);
                response.put("statusCode", HttpStatus.NOT_FOUND.value());
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
            response.put("Mensaje", "Datos correctos");
            response.put("Mascota", opt.get());
            response.put("statusCode", HttpStatus.OK.value());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            response.put("Mensaje", "Ha ocurrido un error: " + e.getMessage());
            response.put("Mascota", null);
            response.put("statusCode", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> listarPorUsuario(Integer idUsuario) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Mascota> lista = mascotaRepositorio.findByIdUsuario(idUsuario);
            response.put("Mensaje", "Mascotas del usuario " + idUsuario);
            response.put("Mascotas", lista);
            response.put("statusCode", HttpStatus.OK.value());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            response.put("Mensaje", "Ha ocurrido un error: " + e.getMessage());
            response.put("Mascotas", null);
            response.put("statusCode", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> crear(Mascota mascota) {
        Map<String, Object> response = new HashMap<>();
        try {
            Mascota guardada = mascotaRepositorio.save(mascota);
            response.put("Mensaje", "Mascota registrada correctamente");
            response.put("Mascota", guardada);
            response.put("statusCode", HttpStatus.CREATED.value());
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            response.put("Mensaje", "Error al registrar la mascota: " + e.getMessage());
            response.put("Mascota", null);
            response.put("statusCode", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> actualizar(Integer id, Mascota mascota) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<Mascota> opt = mascotaRepositorio.findById(id);
            if (opt.isEmpty()) {
                response.put("Mensaje", "Alerta: Mascota no encontrada");
                response.put("Mascota", null);
                response.put("statusCode", HttpStatus.NOT_FOUND.value());
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }

            Mascota existente = opt.get();
            existente.setUsuario(mascota.getUsuario());
            existente.setNombre(mascota.getNombre());
            existente.setEspecie(mascota.getEspecie());
            existente.setRaza(mascota.getRaza());
            existente.setEdad(mascota.getEdad());
            existente.setSexo(mascota.getSexo());
            existente.setPeso(mascota.getPeso());
            existente.setColor(mascota.getColor());

            Mascota actualizada = mascotaRepositorio.save(existente);
            response.put("Mensaje", "Mascota actualizada correctamente");
            response.put("Mascota", actualizada);
            response.put("statusCode", HttpStatus.OK.value());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            response.put("Mensaje", "Error al actualizar: " + e.getMessage());
            response.put("Mascota", null);
            response.put("statusCode", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> eliminar(Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (!mascotaRepositorio.existsById(id)) {
                response.put("Mensaje", "Alerta: Mascota no encontrada");
                response.put("statusCode", HttpStatus.NOT_FOUND.value());
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
            mascotaRepositorio.deleteById(id);
            response.put("Mensaje", "Mascota eliminada correctamente");
            response.put("statusCode", HttpStatus.OK.value());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            response.put("Mensaje", "Error al eliminar: " + e.getMessage());
            response.put("statusCode", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
