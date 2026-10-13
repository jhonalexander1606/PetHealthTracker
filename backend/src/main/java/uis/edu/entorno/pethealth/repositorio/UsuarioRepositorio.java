package uis.edu.entorno.pethealth.repositorio;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import uis.edu.entorno.pethealth.modelo.Usuario;

/**
 * Repositorio JPA para la entidad Usuario.
 *
 * Incluye consultas JPQL personalizadas para:
 *  - Autenticacion (login) por nombre de usuario y contrasena.
 *  - Busqueda por numero de documento (cedula).
 *  - Busqueda por nombre de usuario (para evitar duplicados).
 */
@Repository
public interface UsuarioRepositorio extends JpaRepository<Usuario, Integer> {

    // ----- Consultas JPQL para el login -----

    /**
     * Cuenta cuantos registros coinciden con el nombre de usuario y el password.
     * Devuelve 1 si el login es correcto, 0 si no.
     */
    @Query("select count(u) from Usuario as u "
         + "where u.nombreUsuario = :nombreUsuario and u.password = :password")
    Integer findByNombreUsuarioAndPassword(@Param("nombreUsuario") String nombreUsuario,
                                           @Param("password") String password);

    /**
     * Recupera el objeto Usuario completo cuando coinciden las credenciales.
     */
    @Query("select u from Usuario as u "
         + "where u.nombreUsuario = :nombreUsuario and u.password = :password")
    Usuario findByNameAndPassword(@Param("nombreUsuario") String nombreUsuario,
                                  @Param("password") String password);

    // ----- Consultas por campos de negocio -----

    @Query("select u from Usuario as u where u.numeroDocumento = :numeroDocumento")
    Usuario findByNumeroDocumento(@Param("numeroDocumento") String numeroDocumento);

    @Query("select u from Usuario as u where u.nombreUsuario = :nombreUsuario")
    Usuario findByNombreUsuario(@Param("nombreUsuario") String nombreUsuario);
}
