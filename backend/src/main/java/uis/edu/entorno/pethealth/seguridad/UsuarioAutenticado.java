package uis.edu.entorno.pethealth.seguridad;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import uis.edu.entorno.pethealth.modelo.Usuario;
import uis.edu.entorno.pethealth.repositorio.UsuarioRepositorio;

/**
 * Utilidad para saber QUIEN hace la peticion actual.
 *
 * El JwtAuthenticationFilter deja en el SecurityContext el nombre de usuario
 * que viene dentro del token. Con ese nombre buscamos el Usuario completo en
 * la base de datos (para conocer su id y su rol).
 */
@Component
public class UsuarioAutenticado {

    @Autowired
    private UsuarioRepositorio usuarioRepositorio;

    /** Devuelve el usuario logueado, o null si la peticion no tiene token valido. */
    public Usuario obtener() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            return null;
        }
        return usuarioRepositorio.findByNombreUsuario(auth.getName());
    }

    /** Nombre de usuario del token, o null si no hay sesion. */
    public String nombreUsuario() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth == null ? null : auth.getName();
    }
}
