package uis.edu.entorno.pethealth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Clase principal de arranque del microservicio PetHealth Tracker.
 *
 * Proyecto: Pasaporte Sanitario Digital y Control del Historial Medico de Mascotas.
 * Materia: Entornos de Programacion - UIS 2026-II - Grupo 02.
 *
 * Al ejecutar esta clase se levanta Tomcat embebido en el puerto configurado
 * en application.properties (por defecto 8094) y se expone la API REST en
 * http://localhost:8094 y la documentacion Swagger en /swagger-ui.html.
 */
@SpringBootApplication
public class PetHealthTrackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(PetHealthTrackerApplication.class, args);
    }
}
