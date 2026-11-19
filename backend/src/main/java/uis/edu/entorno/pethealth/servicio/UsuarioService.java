package uis.edu.entorno.pethealth.servicio;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import uis.edu.entorno.pethealth.modelo.LoginDto;
import uis.edu.entorno.pethealth.modelo.Usuario;
import uis.edu.entorno.pethealth.repositorio.MascotaRepositorio;
import uis.edu.entorno.pethealth.repositorio.UsuarioRepositorio;
import uis.edu.entorno.pethealth.seguridad.UsuarioAutenticado;

/**
 * Implementacion del servicio de Usuario (CRUD + Login).
 *
 * El login sigue el mismo patron del Microservicio de Login UIS visto en
 * clase: findByNombreUsuarioAndPassword cuenta las coincidencias y
 * findByNameAndPassword recupera el objeto completo.
 */
@Service
public class UsuarioService implements IUsuarioService {

    @Autowired
    private UsuarioRepositorio usuarioRepositorio;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private MascotaRepositorio mascotaRepositorio;

    @Autowired
    private UsuarioAutenticado usuarioAutenticado;

    /** Roles validos del sistema. */
    private static final List<String> ROLES = List.of("ADMIN", "VETERINARIO", "DUENO");

    // ----- CRUD -----
    @Override
    public List<Usuario> listarTodos() {
        return usuarioRepositorio.findAll();
    }

    @Override
    public ResponseEntity<?> buscarPorId(Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<Usuario> opt = usuarioRepositorio.findById(id);
            if (opt.isEmpty()) {
                response.put("Mensaje", "Alerta: Usuario no encontrado");
                response.put("Usuario", null);
                response.put("statusCode", HttpStatus.NOT_FOUND.value());
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
            response.put("Mensaje", "Datos correctos");
            response.put("Usuario", opt.get());
            response.put("statusCode", HttpStatus.OK.value());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            response.put("Mensaje", "Ha ocurrido un error: " + e.getMessage());
            response.put("Usuario", null);
            response.put("statusCode", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> buscarPorCedula(String numeroDocumento) {
        Map<String, Object> response = new HashMap<>();
        try {
            Usuario usuario = usuarioRepositorio.findByNumeroDocumento(numeroDocumento);
            if (usuario == null) {
                response.put("Mensaje", "Alerta: Usuario con cedula " + numeroDocumento + " no encontrado");
                response.put("Usuario", null);
                response.put("statusCode", HttpStatus.NOT_FOUND.value());
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
            response.put("Mensaje", "Datos correctos");
            response.put("Usuario", usuario);
            response.put("statusCode", HttpStatus.OK.value());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            response.put("Mensaje", "Ha ocurrido un error: " + e.getMessage());
            response.put("Usuario", null);
            response.put("statusCode", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> crear(Usuario usuario) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Validaciones de campos obligatorios y formato
            String error = validarDatos(usuario, true);
            if (error != null) {
                return respuesta(response, error, HttpStatus.BAD_REQUEST);
            }

            // Validacion: nombre de usuario y documento no deben estar repetidos
            String conflicto = validarDuplicados(usuario, null);
            if (conflicto != null) {
                return respuesta(response, conflicto, HttpStatus.CONFLICT);
            }

            // La contrasena se almacena cifrada con BCrypt (nunca en texto plano)
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
            // Si no se especifica un rol, por defecto es DUENO
            if (usuario.getRol() == null || usuario.getRol().isBlank()) {
                usuario.setRol("DUENO");
            }

            Usuario guardado = usuarioRepositorio.save(usuario);
            response.put("Mensaje", "Usuario creado correctamente");
            response.put("Usuario", guardado);
            response.put("statusCode", HttpStatus.CREATED.value());
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            response.put("Mensaje", "Error al crear el usuario: " + e.getMessage());
            response.put("Usuario", null);
            response.put("statusCode", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> actualizar(Integer id, Usuario usuario) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<Usuario> opt = usuarioRepositorio.findById(id);
            if (opt.isEmpty()) {
                response.put("Mensaje", "Alerta: Usuario no encontrado");
                response.put("Usuario", null);
                response.put("statusCode", HttpStatus.NOT_FOUND.value());
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }

            String error = validarDatos(usuario, false);
            if (error != null) {
                return respuesta(response, error, HttpStatus.BAD_REQUEST);
            }
            String conflicto = validarDuplicados(usuario, id);
            if (conflicto != null) {
                return respuesta(response, conflicto, HttpStatus.CONFLICT);
            }

            Usuario existente = opt.get();

            // Un administrador no puede quitarse a si mismo el rol ADMIN
            // (evita que el sistema se quede sin nadie que administre usuarios).
            boolean esUnoMismo = existente.getNombreUsuario().equals(usuarioAutenticado.nombreUsuario());
            if (esUnoMismo && "ADMIN".equals(existente.getRol())
                    && usuario.getRol() != null && !"ADMIN".equals(usuario.getRol())) {
                return respuesta(response, "No puede quitarse a si mismo el rol de administrador",
                        HttpStatus.CONFLICT);
            }

            existente.setTipoDocumento(usuario.getTipoDocumento());
            existente.setNumeroDocumento(usuario.getNumeroDocumento());
            existente.setNombreCompleto(usuario.getNombreCompleto());
            existente.setEmail(usuario.getEmail());
            existente.setTelefono(usuario.getTelefono());
            existente.setNombreUsuario(usuario.getNombreUsuario());
            // El rol solo se actualiza si viene informado
            if (usuario.getRol() != null && !usuario.getRol().isBlank()) {
                existente.setRol(usuario.getRol());
            }
            // Si viene password vacio, mantenemos el actual (edicion sin cambiar clave).
            // Si viene una nueva, se cifra con BCrypt antes de guardarla.
            if (usuario.getPassword() != null && !usuario.getPassword().isBlank()) {
                existente.setPassword(passwordEncoder.encode(usuario.getPassword()));
            }

            Usuario actualizado = usuarioRepositorio.save(existente);
            response.put("Mensaje", "Usuario actualizado correctamente");
            response.put("Usuario", actualizado);
            response.put("statusCode", HttpStatus.OK.value());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            response.put("Mensaje", "Error al actualizar: " + e.getMessage());
            response.put("Usuario", null);
            response.put("statusCode", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> eliminar(Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (!usuarioRepositorio.existsById(id)) {
                response.put("Mensaje", "Alerta: Usuario no encontrado");
                response.put("statusCode", HttpStatus.NOT_FOUND.value());
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
            Usuario objetivo = usuarioRepositorio.findById(id).get();

            // No se permite eliminar la propia cuenta con la sesion abierta
            if (objetivo.getNombreUsuario().equals(usuarioAutenticado.nombreUsuario())) {
                response.put("Mensaje", "No puede eliminar su propia cuenta mientras tiene la sesion iniciada");
                response.put("statusCode", HttpStatus.CONFLICT.value());
                return new ResponseEntity<>(response, HttpStatus.CONFLICT);
            }

            // Integridad referencial: un dueno con mascotas no se puede borrar
            long mascotas = mascotaRepositorio.contarPorUsuario(id);
            if (mascotas > 0) {
                response.put("Mensaje", "No se puede eliminar: el usuario tiene " + mascotas
                        + " mascota(s) registrada(s). Elimine o reasigne primero sus mascotas.");
                response.put("statusCode", HttpStatus.CONFLICT.value());
                return new ResponseEntity<>(response, HttpStatus.CONFLICT);
            }

            usuarioRepositorio.deleteById(id);
            response.put("Mensaje", "Usuario eliminado correctamente");
            response.put("statusCode", HttpStatus.OK.value());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            response.put("Mensaje", "Error al eliminar: " + e.getMessage());
            response.put("statusCode", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ----- Login (microservicio) -----
    @Override
    public int login(LoginDto loginDto) {
        Integer coincidencias = usuarioRepositorio.findByNombreUsuarioAndPassword(
                loginDto.getNombreUsuario(), loginDto.getPassword());
        return coincidencias == null ? 0 : coincidencias;
    }

    @Override
    public ResponseEntity<?> ingresar(LoginDto loginDto) {
        Map<String, Object> response = new HashMap<>();
        Usuario usuario;
        try {
            usuario = usuarioRepositorio.findByNameAndPassword(
                    loginDto.getNombreUsuario(), loginDto.getPassword());

            if (usuario == null) {
                response.put("Usuario", null);
                response.put("Mensaje", "Alerta: Usuario o Password incorrectos");
                response.put("statusCode", HttpStatus.NOT_FOUND.value());
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            } else {
                response.put("Usuario", usuario);
                response.put("Mensaje", "Datos correctos");
                response.put("statusCode", HttpStatus.OK.value());
                return new ResponseEntity<>(response, HttpStatus.OK);
            }
        } catch (Exception e) {
            response.put("Usuario", null);
            response.put("Mensaje", "Ha ocurrido un error: " + e.getMessage());
            response.put("statusCode", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ----- Validaciones de negocio -----

    /**
     * Valida campos obligatorios y formatos. La contrasena solo es obligatoria
     * al crear (al editar, si viene vacia se conserva la actual).
     */
    private String validarDatos(Usuario u, boolean esCreacion) {
        if (u == null) {
            return "No se recibieron los datos del usuario";
        }
        if (u.getTipoDocumento() == null || u.getTipoDocumento().getId() == null) {
            return "Seleccione el tipo de documento";
        }
        if (u.getNumeroDocumento() == null || !u.getNumeroDocumento().trim().matches("[0-9A-Za-z]{5,20}")) {
            return "El numero de documento debe tener entre 5 y 20 caracteres alfanumericos";
        }
        if (u.getNombreCompleto() == null || u.getNombreCompleto().trim().length() < 3) {
            return "El nombre completo es obligatorio (minimo 3 caracteres)";
        }
        if (u.getEmail() == null || !u.getEmail().trim().matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            return "El correo electronico no tiene un formato valido";
        }
        if (u.getNombreUsuario() == null || !u.getNombreUsuario().trim().matches("[A-Za-z0-9._]{4,30}")) {
            return "El nombre de usuario debe tener entre 4 y 30 caracteres (letras, numeros, punto o guion bajo)";
        }
        boolean traePassword = u.getPassword() != null && !u.getPassword().isBlank();
        if (esCreacion && !traePassword) {
            return "La contrasena es obligatoria";
        }
        if (traePassword && u.getPassword().length() < 6) {
            return "La contrasena debe tener al menos 6 caracteres";
        }
        if (u.getRol() != null && !u.getRol().isBlank() && !ROLES.contains(u.getRol())) {
            return "Rol invalido. Valores permitidos: " + ROLES;
        }
        return null;
    }

    /**
     * Verifica que el nombre de usuario y el documento no esten en uso por
     * OTRO usuario. idActual es null al crear, o el id del usuario que se edita.
     */
    private String validarDuplicados(Usuario u, Integer idActual) {
        Usuario mismoNombre = usuarioRepositorio.findByNombreUsuario(u.getNombreUsuario().trim());
        if (mismoNombre != null && !mismoNombre.getId().equals(idActual)) {
            return "El nombre de usuario '" + u.getNombreUsuario() + "' ya esta en uso";
        }
        Usuario mismoDocumento = usuarioRepositorio.findByNumeroDocumento(u.getNumeroDocumento().trim());
        if (mismoDocumento != null && !mismoDocumento.getId().equals(idActual)) {
            return "Ya existe un usuario registrado con el documento " + u.getNumeroDocumento();
        }
        return null;
    }

    private ResponseEntity<?> respuesta(Map<String, Object> response, String mensaje, HttpStatus estado) {
        response.put("Mensaje", mensaje);
        response.put("Usuario", null);
        response.put("statusCode", estado.value());
        return new ResponseEntity<>(response, estado);
    }
}
