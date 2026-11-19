package uis.edu.entorno.pethealth.controlador;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/**
 * Manejador global de errores de la API.
 *
 * Convierte los errores de formato de la peticion en respuestas JSON con el
 * mismo formato que el resto de la API ({Mensaje, statusCode}), en lugar de
 * la pagina de error generica de Spring.
 */
@RestControllerAdvice
public class ManejadorErrores {

    /** JSON mal formado o con tipos incorrectos (ej. una fecha invalida). */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> jsonInvalido(HttpMessageNotReadableException e) {
        return respuesta("Los datos enviados no tienen un formato valido", HttpStatus.BAD_REQUEST);
    }

    /** Parametro de la URL con tipo incorrecto (ej. /api/mascotas/abc). */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> parametroInvalido(MethodArgumentTypeMismatchException e) {
        return respuesta("El parametro '" + e.getName() + "' no tiene un valor valido", HttpStatus.BAD_REQUEST);
    }

    private ResponseEntity<Map<String, Object>> respuesta(String mensaje, HttpStatus estado) {
        Map<String, Object> body = new HashMap<>();
        body.put("Mensaje", mensaje);
        body.put("statusCode", estado.value());
        return new ResponseEntity<>(body, estado);
    }
}
