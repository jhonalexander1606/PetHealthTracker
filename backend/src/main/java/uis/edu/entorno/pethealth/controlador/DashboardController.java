package uis.edu.entorno.pethealth.controlador;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import uis.edu.entorno.pethealth.servicio.IDashboardService;

/**
 * Controlador REST del panel principal.
 *
 * Endpoints bajo /api/dashboard :
 *  GET /resumen -> totales, graficas, alertas de vacunacion y actividad reciente.
 *                  Un DUENO solo recibe la informacion de sus propias mascotas.
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private IDashboardService dashboardService;

    @GetMapping("/resumen")
    public ResponseEntity<?> resumen() {
        return dashboardService.resumen();
    }
}
