package uis.edu.entorno.pethealth.servicio;

import org.springframework.http.ResponseEntity;

/**
 * Interfaz del servicio de estadisticas del panel principal.
 */
public interface IDashboardService {

    /**
     * Resumen del sistema para el usuario logueado: totales, graficas,
     * alertas de vacunacion y actividad reciente.
     */
    ResponseEntity<?> resumen();
}
