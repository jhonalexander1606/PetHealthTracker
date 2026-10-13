package uis.edu.entorno.pethealth.servicio;

import java.util.List;

import org.springframework.http.ResponseEntity;

import uis.edu.entorno.pethealth.modelo.LoginDto;
import uis.edu.entorno.pethealth.modelo.Usuario;

/**
 * Interfaz del servicio de Usuario.
 *
 * Expone las operaciones del CRUD de usuarios y del microservicio de login
 * (siguiendo exactamente el patron visto en clase con el MicroservicioLogin
 * de Acceso UIS).
 */
public interface IUsuarioService {

    // ----- CRUD -----
    List<Usuario> listarTodos();

    ResponseEntity<?> buscarPorId(Integer id);

    ResponseEntity<?> buscarPorCedula(String numeroDocumento);

    ResponseEntity<?> crear(Usuario usuario);

    ResponseEntity<?> actualizar(Integer id, Usuario usuario);

    ResponseEntity<?> eliminar(Integer id);

    // ----- Login (microservicio de autenticacion) -----

    /**
     * Devuelve 1 si las credenciales son correctas, 0 si no.
     * Equivalente al endpoint "/api/usuarios/loginclient" del profe.
     */
    int login(LoginDto loginDto);

    /**
     * Devuelve el objeto Usuario completo si las credenciales son correctas,
     * o un mensaje de error en caso contrario.
     */
    ResponseEntity<?> ingresar(LoginDto loginDto);
}
