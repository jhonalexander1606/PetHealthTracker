package uis.edu.entorno.pethealth.repositorio;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import uis.edu.entorno.pethealth.modelo.Mascota;

/**
 * Repositorio JPA para la entidad Mascota.
 *
 * Expone operaciones CRUD y una consulta JPQL que recupera las
 * mascotas pertenecientes a un dueno (RNF-03: cada usuario solo
 * puede ver sus propias mascotas).
 */
@Repository
public interface MascotaRepositorio extends JpaRepository<Mascota, Integer> {

    @Query("select m from Mascota as m where m.usuario.id = :idUsuario")
    List<Mascota> findByIdUsuario(@Param("idUsuario") Integer idUsuario);
}
