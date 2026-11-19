package uis.edu.entorno.pethealth.controlador;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import uis.edu.entorno.pethealth.servicio.IPerfilService;

/**
 * Controlador REST de "Mi perfil" (cualquier usuario autenticado).
 *
 * Endpoints bajo /api/perfil :
 *  GET  /          -> datos del usuario logueado
 *  PUT  /          -> actualizar nombre, email y telefono propios
 *  PUT  /password  -> cambiar la contrasena propia {passwordActual, passwordNueva}
 */
@RestController
@RequestMapping("/api/perfil")
public class PerfilController {

    @Autowired
    private IPerfilService perfilService;

    @GetMapping
    public ResponseEntity<?> obtener() {
        return perfilService.obtener();
    }

    @PutMapping
    public ResponseEntity<?> actualizarDatos(@RequestBody Map<String, String> datos) {
        return perfilService.actualizarDatos(datos);
    }

    @PutMapping("/password")
    public ResponseEntity<?> cambiarPassword(@RequestBody Map<String, String> datos) {
        return perfilService.cambiarPassword(datos);
    }
}
