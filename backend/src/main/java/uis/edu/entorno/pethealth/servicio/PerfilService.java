package uis.edu.entorno.pethealth.servicio;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import uis.edu.entorno.pethealth.modelo.Usuario;
import uis.edu.entorno.pethealth.repositorio.MascotaRepositorio;
import uis.edu.entorno.pethealth.repositorio.UsuarioRepositorio;
import uis.edu.entorno.pethealth.seguridad.UsuarioAutenticado;

/**
 * Implementacion de "Mi perfil".
 *
 * El usuario se identifica con el token JWT (no con un id en la URL), por lo
 * que nadie puede consultar ni modificar la cuenta de otra persona por aqui.
 */
@Service
public class PerfilService implements IPerfilService {

    @Autowired
    private UsuarioAutenticado usuarioAutenticado;

    @Autowired
    private UsuarioRepositorio usuarioRepositorio;

    @Autowired
    private MascotaRepositorio mascotaRepositorio;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public ResponseEntity<?> obtener() {
        Map<String, Object> response = new HashMap<>();
        Usuario actual = usuarioAutenticado.obtener();
        if (actual == null) {
            return error(response, "No hay una sesion valida", HttpStatus.UNAUTHORIZED);
        }
        response.put("Mensaje", "Datos correctos");
        response.put("Usuario", actual);
        response.put("totalMascotas", mascotaRepositorio.contarPorUsuario(actual.getId()));
        response.put("statusCode", HttpStatus.OK.value());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /** Actualiza solo los datos de contacto: nombre completo, email y telefono. */
    @Override
    public ResponseEntity<?> actualizarDatos(Map<String, String> datos) {
        Map<String, Object> response = new HashMap<>();
        Usuario actual = usuarioAutenticado.obtener();
        if (actual == null) {
            return error(response, "No hay una sesion valida", HttpStatus.UNAUTHORIZED);
        }

        String nombre = valor(datos, "nombreCompleto");
        String email = valor(datos, "email");
        String telefono = valor(datos, "telefono");

        if (nombre.length() < 3) {
            return error(response, "El nombre completo es obligatorio (minimo 3 caracteres)", HttpStatus.BAD_REQUEST);
        }
        if (!email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            return error(response, "El correo electronico no tiene un formato valido", HttpStatus.BAD_REQUEST);
        }
        if (!telefono.isEmpty() && !telefono.matches("[0-9+ ()-]{7,20}")) {
            return error(response, "El telefono solo puede tener numeros, espacios y los simbolos + ( ) -", HttpStatus.BAD_REQUEST);
        }

        actual.setNombreCompleto(nombre);
        actual.setEmail(email);
        actual.setTelefono(telefono.isEmpty() ? null : telefono);
        Usuario guardado = usuarioRepositorio.save(actual);

        response.put("Mensaje", "Datos actualizados correctamente");
        response.put("Usuario", guardado);
        response.put("statusCode", HttpStatus.OK.value());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * Cambia la contrasena propia. Exige la contrasena actual para evitar que
     * alguien con el computador desbloqueado cambie la clave de otra persona.
     */
    @Override
    public ResponseEntity<?> cambiarPassword(Map<String, String> datos) {
        Map<String, Object> response = new HashMap<>();
        Usuario actual = usuarioAutenticado.obtener();
        if (actual == null) {
            return error(response, "No hay una sesion valida", HttpStatus.UNAUTHORIZED);
        }

        String passwordActual = valor(datos, "passwordActual");
        String passwordNueva = valor(datos, "passwordNueva");

        if (!passwordEncoder.matches(passwordActual, actual.getPassword())) {
            return error(response, "La contrasena actual no es correcta", HttpStatus.BAD_REQUEST);
        }
        if (passwordNueva.length() < 6) {
            return error(response, "La nueva contrasena debe tener al menos 6 caracteres", HttpStatus.BAD_REQUEST);
        }
        if (passwordNueva.equals(passwordActual)) {
            return error(response, "La nueva contrasena debe ser diferente a la actual", HttpStatus.BAD_REQUEST);
        }

        actual.setPassword(passwordEncoder.encode(passwordNueva));
        usuarioRepositorio.save(actual);

        response.put("Mensaje", "Contrasena actualizada correctamente");
        response.put("statusCode", HttpStatus.OK.value());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    private String valor(Map<String, String> datos, String clave) {
        if (datos == null || datos.get(clave) == null) {
            return "";
        }
        return datos.get(clave).trim();
    }

    private ResponseEntity<?> error(Map<String, Object> response, String mensaje, HttpStatus estado) {
        response.put("Mensaje", mensaje);
        response.put("statusCode", estado.value());
        return new ResponseEntity<>(response, estado);
    }
}
