package uis.edu.entorno.pethealth.servicio;

import java.util.Map;

import org.springframework.http.ResponseEntity;

/**
 * Interfaz del servicio "Mi perfil": operaciones que cada usuario puede
 * hacer sobre su PROPIA cuenta, sin importar su rol.
 */
public interface IPerfilService {

    ResponseEntity<?> obtener();

    ResponseEntity<?> actualizarDatos(Map<String, String> datos);

    ResponseEntity<?> cambiarPassword(Map<String, String> datos);
}
