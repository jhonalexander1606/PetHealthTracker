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
import uis.edu.entorno.pethealth.repositorio.UsuarioRepositorio;

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
            // Validacion: nombre de usuario no debe estar repetido
            Usuario existente = usuarioRepositorio.findByNombreUsuario(usuario.getNombreUsuario());
            if (existente != null) {
                response.put("Mensaje", "Alerta: el nombre de usuario '" + usuario.getNombreUsuario() + "' ya esta en uso");
                response.put("Usuario", null);
                response.put("statusCode", HttpStatus.CONFLICT.value());
                return new ResponseEntity<>(response, HttpStatus.CONFLICT);
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

            Usuario existente = opt.get();
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
}
