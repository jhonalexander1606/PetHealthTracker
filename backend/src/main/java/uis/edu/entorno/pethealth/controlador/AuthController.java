package uis.edu.entorno.pethealth.controlador;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import uis.edu.entorno.pethealth.modelo.AuthResponse;
import uis.edu.entorno.pethealth.modelo.LoginDto;
import uis.edu.entorno.pethealth.modelo.Usuario;
import uis.edu.entorno.pethealth.repositorio.UsuarioRepositorio;
import uis.edu.entorno.pethealth.seguridad.JwtUtil;

/**
 * Controlador de autenticacion (login con JWT).
 *
 * Expone el endpoint publico POST /api/auth/login que:
 *   1. Valida las credenciales con el AuthenticationManager de Spring Security
 *      (compara la contrasena contra el hash BCrypt almacenado).
 *   2. Si son correctas, genera un token JWT firmado con el rol del usuario.
 *   3. Devuelve el token y los datos basicos del usuario.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UsuarioRepositorio usuarioRepositorio;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto loginDto) {
        try {
            // 1. Autentica usuario y contrasena (lanza excepcion si no coinciden)
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginDto.getNombreUsuario(), loginDto.getPassword()));

            // 2. Recupera el usuario para obtener su rol, id y nombre completo
            Usuario usuario = usuarioRepositorio.findByNombreUsuario(loginDto.getNombreUsuario());

            // 3. Genera el token JWT
            String token = jwtUtil.generarToken(
                    usuario.getNombreUsuario(), usuario.getRol(), usuario.getId());

            AuthResponse respuesta = new AuthResponse(
                    token,
                    usuario.getId(),
                    usuario.getNombreUsuario(),
                    usuario.getNombreCompleto(),
                    usuario.getRol());

            return new ResponseEntity<>(respuesta, HttpStatus.OK);

        } catch (BadCredentialsException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("Mensaje", "Usuario o contrasena incorrectos");
            error.put("statusCode", HttpStatus.UNAUTHORIZED.value());
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("Mensaje", "Error en el login: " + e.getMessage());
            error.put("statusCode", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
