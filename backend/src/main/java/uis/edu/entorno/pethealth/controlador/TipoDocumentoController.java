package uis.edu.entorno.pethealth.controlador;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import uis.edu.entorno.pethealth.modelo.TipoDocumento;
import uis.edu.entorno.pethealth.servicio.ITipoDocumentoService;

/**
 * Controlador REST para la administracion de tipos de documento.
 *
 * Endpoints expuestos bajo /api/tipodocumento :
 *  GET    /list              -> lista todos los tipos
 *  GET    /{id}              -> busca uno por id
 *  POST   /save              -> crea uno nuevo
 *  PUT    /update/{id}       -> actualiza
 *  DELETE /delete/{id}       -> elimina
 */
@RestController
@RequestMapping("/api/tipodocumento")
public class TipoDocumentoController {

    @Autowired
    private ITipoDocumentoService tipoDocumentoService;

    @GetMapping("/list")
    public List<TipoDocumento> listar() {
        return tipoDocumentoService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscar(@PathVariable Integer id) {
        return tipoDocumentoService.buscarPorId(id);
    }

    @PostMapping("/save")
    public ResponseEntity<?> crear(@RequestBody TipoDocumento tipoDocumento) {
        return tipoDocumentoService.crear(tipoDocumento);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id,
                                        @RequestBody TipoDocumento tipoDocumento) {
        return tipoDocumentoService.actualizar(id, tipoDocumento);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        return tipoDocumentoService.eliminar(id);
    }
}
