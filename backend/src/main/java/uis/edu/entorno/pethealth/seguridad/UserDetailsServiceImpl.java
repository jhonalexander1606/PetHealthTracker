package uis.edu.entorno.pethealth.seguridad;

import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import uis.edu.entorno.pethealth.modelo.Usuario;
import uis.edu.entorno.pethealth.repositorio.UsuarioRepositorio;

/**
 * Carga los datos de un usuario desde la base de datos para que Spring Security
 * pueda autenticarlo.
 *
 * Convierte el rol almacenado (ADMIN, VETERINARIO, DUENO) en una autoridad de
 * Spring con el prefijo "ROLE_" (ej: ROLE_ADMIN), que es lo que esperan las
 * reglas hasRole(...) de la configuracion de seguridad.
 */
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UsuarioRepositorio usuarioRepositorio;

    @Override
    public UserDetails loadUserByUsername(String nombreUsuario) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepositorio.findByNombreUsuario(nombreUsuario);
        if (usuario == null) {
            throw new UsernameNotFoundException("Usuario no encontrado: " + nombreUsuario);
        }

        String rol = usuario.getRol() != null ? usuario.getRol() : "DUENO";

        return new User(
                usuario.getNombreUsuario(),
                usuario.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + rol))
        );
    }
}
