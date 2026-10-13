package uis.edu.entorno.pethealth.controlador;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import uis.edu.entorno.pethealth.modelo.LoginDto;
import uis.edu.entorno.pethealth.modelo.Usuario;
import uis.edu.entorno.pethealth.servicio.IUsuarioService;

/**
 * Controlador REST de usuarios (CRUD + Login).
 *
 * Endpoints bajo /api/usuarios :
 *  GET    /list                     -> listar todos
 *  GET    /{id}                     -> buscar por id
 *  GET    /cedula/{numeroDocumento} -> buscar por cedula (HU003)
 *  POST   /save                     -> crear (HU002)
 *  PUT    /update/{id}              -> actualizar (HU004)
 *  DELETE /delete/{id}              -> eliminar (HU005)
 *  POST   /loginclient              -> devuelve 1 o 0 (login simple del front)
 *  POST   /login                    -> devuelve el usuario completo
 */
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private IUsuarioService usuarioService;

    // ----- CRUD -----

    @GetMapping("/list")
    public List<Usuario> listar() {
        return usuarioService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscar(@PathVariable Integer id) {
        return usuarioService.buscarPorId(id);
    }

    @GetMapping("/cedula/{numeroDocumento}")
    public ResponseEntity<?> buscarPorCedula(@PathVariable String numeroDocumento) {
        return usuarioService.buscarPorCedula(numeroDocumento);
    }

    @PostMapping("/save")
    public ResponseEntity<?> crear(@RequestBody Usuario usuario) {
        return usuarioService.crear(usuario);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id,
                                        @RequestBody Usuario usuario) {
        return usuarioService.actualizar(id, usuario);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        return usuarioService.eliminar(id);
    }

    // ----- Login (microservicio de autenticacion - HU001) -----

    /**
     * Devuelve 1 si el usuario y la clave coinciden, 0 si no.
     * Lo consume el frontend desde login.js (window.location = 'menu.html').
     */
    @PostMapping("/loginclient")
    public int login(@RequestBody LoginDto loginDto) {
        return usuarioService.login(loginDto);
    }

    /**
     * Devuelve el objeto Usuario completo cuando el login es correcto, o
     * un mensaje de error en caso contrario.
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginCompleto(@RequestBody LoginDto loginDto) {
        return usuarioService.ingresar(loginDto);
    }
}
