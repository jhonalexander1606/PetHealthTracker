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

import uis.edu.entorno.pethealth.modelo.Mascota;
import uis.edu.entorno.pethealth.servicio.IMascotaService;

/**
 * Controlador REST para la gestion de mascotas (HU006).
 *
 * Endpoints bajo /api/mascotas :
 *  GET    /list                 -> listar todas
 *  GET    /{id}                 -> buscar por id
 *  GET    /usuario/{idUsuario}  -> listar mascotas de un dueno (RNF-03)
 *  POST   /save                 -> registrar nueva mascota
 *  PUT    /update/{id}          -> actualizar
 *  DELETE /delete/{id}          -> eliminar
 */
@RestController
@RequestMapping("/api/mascotas")
public class MascotaController {

    @Autowired
    private IMascotaService mascotaService;

    @GetMapping("/list")
    public List<Mascota> listar() {
        return mascotaService.listarTodas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscar(@PathVariable Integer id) {
        return mascotaService.buscarPorId(id);
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> listarPorUsuario(@PathVariable Integer idUsuario) {
        return mascotaService.listarPorUsuario(idUsuario);
    }

    @PostMapping("/save")
    public ResponseEntity<?> crear(@RequestBody Mascota mascota) {
        return mascotaService.crear(mascota);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id,
                                        @RequestBody Mascota mascota) {
        return mascotaService.actualizar(id, mascota);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        return mascotaService.eliminar(id);
    }
}
