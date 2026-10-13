package uis.edu.entorno.pethealth.servicio;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import uis.edu.entorno.pethealth.modelo.TipoDocumento;
import uis.edu.entorno.pethealth.repositorio.TipoDocumentoRepositorio;

/**
 * Implementacion del servicio de TipoDocumento.
 *
 * Sigue el patron visto en clase: respuesta uniforme con Map<String,Object>
 * que incluye "Mensaje", el objeto resultante y el "statusCode" HTTP.
 */
@Service
public class TipoDocumentoService implements ITipoDocumentoService {

    @Autowired
    private TipoDocumentoRepositorio tipoDocumentoRepositorio;

    @Override
    public List<TipoDocumento> listarTodos() {
        return tipoDocumentoRepositorio.findAll();
    }

    @Override
    public ResponseEntity<?> buscarPorId(Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<TipoDocumento> opt = tipoDocumentoRepositorio.findById(id);
            if (opt.isEmpty()) {
                response.put("Mensaje", "Alerta: TipoDocumento no encontrado");
                response.put("TipoDocumento", null);
                response.put("statusCode", HttpStatus.NOT_FOUND.value());
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
            response.put("Mensaje", "Datos correctos");
            response.put("TipoDocumento", opt.get());
            response.put("statusCode", HttpStatus.OK.value());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            response.put("Mensaje", "Ha ocurrido un error: " + e.getMessage());
            response.put("TipoDocumento", null);
            response.put("statusCode", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> crear(TipoDocumento tipoDocumento) {
        Map<String, Object> response = new HashMap<>();
        try {
            TipoDocumento guardado = tipoDocumentoRepositorio.save(tipoDocumento);
            response.put("Mensaje", "TipoDocumento creado correctamente");
            response.put("TipoDocumento", guardado);
            response.put("statusCode", HttpStatus.CREATED.value());
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            response.put("Mensaje", "Error al crear el TipoDocumento: " + e.getMessage());
            response.put("TipoDocumento", null);
            response.put("statusCode", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> actualizar(Integer id, TipoDocumento tipoDocumento) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<TipoDocumento> opt = tipoDocumentoRepositorio.findById(id);
            if (opt.isEmpty()) {
                response.put("Mensaje", "Alerta: TipoDocumento no encontrado");
                response.put("TipoDocumento", null);
                response.put("statusCode", HttpStatus.NOT_FOUND.value());
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
            TipoDocumento existente = opt.get();
            existente.setTipo(tipoDocumento.getTipo());
            TipoDocumento actualizado = tipoDocumentoRepositorio.save(existente);
            response.put("Mensaje", "TipoDocumento actualizado correctamente");
            response.put("TipoDocumento", actualizado);
            response.put("statusCode", HttpStatus.OK.value());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            response.put("Mensaje", "Error al actualizar: " + e.getMessage());
            response.put("TipoDocumento", null);
            response.put("statusCode", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> eliminar(Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (!tipoDocumentoRepositorio.existsById(id)) {
                response.put("Mensaje", "Alerta: TipoDocumento no encontrado");
                response.put("statusCode", HttpStatus.NOT_FOUND.value());
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
            tipoDocumentoRepositorio.deleteById(id);
            response.put("Mensaje", "TipoDocumento eliminado correctamente");
            response.put("statusCode", HttpStatus.OK.value());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            response.put("Mensaje", "Error al eliminar: " + e.getMessage());
            response.put("statusCode", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
