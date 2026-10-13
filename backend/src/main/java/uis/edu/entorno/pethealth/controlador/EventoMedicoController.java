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

import uis.edu.entorno.pethealth.modelo.EventoMedico;
import uis.edu.entorno.pethealth.servicio.IEventoMedicoService;

/**
 * Controlador REST para la gestion de eventos medicos (HU007).
 *
 * Endpoints bajo /api/eventos :
 *  GET    /list                  -> listar todos
 *  GET    /{id}                  -> buscar por id
 *  GET    /mascota/{idMascota}   -> historial medico de una mascota (RF-06)
 *  POST   /save                  -> registrar evento (vacuna, consulta, etc.)
 *  PUT    /update/{id}           -> actualizar
 *  DELETE /delete/{id}           -> eliminar
 */
@RestController
@RequestMapping("/api/eventos")
public class EventoMedicoController {

    @Autowired
    private IEventoMedicoService eventoMedicoService;

    @GetMapping("/list")
    public List<EventoMedico> listar() {
        return eventoMedicoService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscar(@PathVariable Integer id) {
        return eventoMedicoService.buscarPorId(id);
    }

    @GetMapping("/mascota/{idMascota}")
    public ResponseEntity<?> listarPorMascota(@PathVariable Integer idMascota) {
        return eventoMedicoService.listarPorMascota(idMascota);
    }

    @PostMapping("/save")
    public ResponseEntity<?> crear(@RequestBody EventoMedico evento) {
        return eventoMedicoService.crear(evento);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id,
                                        @RequestBody EventoMedico evento) {
        return eventoMedicoService.actualizar(id, evento);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        return eventoMedicoService.eliminar(id);
    }
}
