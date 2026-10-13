package uis.edu.entorno.pethealth.servicio;

import java.util.List;

import org.springframework.http.ResponseEntity;

import uis.edu.entorno.pethealth.modelo.TipoDocumento;

/**
 * Interfaz del servicio de TipoDocumento.
 * Define las operaciones de negocio soportadas.
 */
public interface ITipoDocumentoService {

    List<TipoDocumento> listarTodos();

    ResponseEntity<?> buscarPorId(Integer id);

    ResponseEntity<?> crear(TipoDocumento tipoDocumento);

    ResponseEntity<?> actualizar(Integer id, TipoDocumento tipoDocumento);

    ResponseEntity<?> eliminar(Integer id);
}
