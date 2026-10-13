package uis.edu.entorno.pethealth.repositorio;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import uis.edu.entorno.pethealth.modelo.EventoMedico;

/**
 * Repositorio JPA para la entidad EventoMedico.
 *
 * Incluye consultas para:
 *  - Listar todos los eventos de una mascota ordenados cronologicamente
 *    descendentemente (RF-06 - consulta cronologica).
 */
@Repository
public interface EventoMedicoRepositorio extends JpaRepository<EventoMedico, Integer> {

    @Query("select e from EventoMedico as e "
         + "where e.mascota.id = :idMascota "
         + "order by e.fechaAplicacion desc")
    List<EventoMedico> findByIdMascota(@Param("idMascota") Integer idMascota);
}
