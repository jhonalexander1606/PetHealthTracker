package uis.edu.entorno.pethealth.servicio;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import uis.edu.entorno.pethealth.modelo.Mascota;
import uis.edu.entorno.pethealth.repositorio.EventoMedicoRepositorio;
import uis.edu.entorno.pethealth.repositorio.MascotaRepositorio;
import uis.edu.entorno.pethealth.repositorio.UsuarioRepositorio;

/**
 * Implementacion del servicio de Mascota.
 *
 * Reglas de negocio:
 *  - Nombre, especie, edad y dueno son obligatorios; la edad y el peso no
 *    pueden ser negativos (respuesta 400 con el motivo).
 *  - El dueno debe existir en la base de datos.
 *  - Al eliminar una mascota se eliminan tambien sus eventos medicos, dentro
 *    de una misma transaccion (si algo falla, no se borra nada).
 */
@Service
public class MascotaService implements IMascotaService {

    @Autowired
    private MascotaRepositorio mascotaRepositorio;

    @Autowired
    private EventoMedicoRepositorio eventoMedicoRepositorio;

    @Autowired
    private UsuarioRepositorio usuarioRepositorio;

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
            response.put("totalEventos", eventoMedicoRepositorio.contarPorMascota(id));
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
            String error = validar(mascota);
            if (error != null) {
                return respuestaInvalida(response, error);
            }
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

            String error = validar(mascota);
            if (error != null) {
                return respuestaInvalida(response, error);
            }

            Mascota existente = opt.get();
            existente.setUsuario(mascota.getUsuario());
            existente.setNombre(mascota.getNombre().trim());
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

    /**
     * Elimina la mascota y, en la misma transaccion, todo su historial medico.
     */
    @Override
    @Transactional
    public ResponseEntity<?> eliminar(Integer id) {
        Map<String, Object> response = new HashMap<>();
        if (!mascotaRepositorio.existsById(id)) {
            response.put("Mensaje", "Alerta: Mascota no encontrada");
            response.put("statusCode", HttpStatus.NOT_FOUND.value());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
        int eventosEliminados = eventoMedicoRepositorio.eliminarPorMascota(id);
        mascotaRepositorio.deleteById(id);
        response.put("Mensaje", "Mascota eliminada correctamente junto con "
                + eventosEliminados + " evento(s) medico(s)");
        response.put("eventosEliminados", eventosEliminados);
        response.put("statusCode", HttpStatus.OK.value());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // ----- Validaciones de negocio -----

    /** Devuelve el motivo del error, o null si la mascota es valida. */
    private String validar(Mascota m) {
        if (m == null) {
            return "No se recibieron los datos de la mascota";
        }
        if (m.getNombre() == null || m.getNombre().isBlank()) {
            return "El nombre de la mascota es obligatorio";
        }
        if (m.getEspecie() == null || m.getEspecie().isBlank()) {
            return "La especie es obligatoria";
        }
        if (m.getEdad() == null || m.getEdad() < 0 || m.getEdad() > 40) {
            return "La edad debe estar entre 0 y 40 anos";
        }
        if (m.getPeso() != null && (m.getPeso() <= 0 || m.getPeso() > 200)) {
            return "El peso debe ser mayor que 0 y menor o igual a 200 kg";
        }
        if (m.getUsuario() == null || m.getUsuario().getId() == null) {
            return "Debe seleccionar el dueno de la mascota";
        }
        if (!usuarioRepositorio.existsById(m.getUsuario().getId())) {
            return "El dueno seleccionado no existe";
        }
        return null;
    }

    private ResponseEntity<?> respuestaInvalida(Map<String, Object> response, String mensaje) {
        response.put("Mensaje", mensaje);
        response.put("Mascota", null);
        response.put("statusCode", HttpStatus.BAD_REQUEST.value());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
}
