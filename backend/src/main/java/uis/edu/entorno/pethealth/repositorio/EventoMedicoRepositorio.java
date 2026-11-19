package uis.edu.entorno.pethealth.repositorio;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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
 *  - Listar todos los eventos del sistema del mas reciente al mas antiguo.
 *  - Contar y eliminar los eventos de una mascota (borrado en cascada
 *    controlado cuando se elimina la mascota).
 */
@Repository
public interface EventoMedicoRepositorio extends JpaRepository<EventoMedico, Integer> {

    @Query("select e from EventoMedico as e "
         + "where e.mascota.id = :idMascota "
         + "order by e.fechaAplicacion desc, e.id desc")
    List<EventoMedico> findByIdMascota(@Param("idMascota") Integer idMascota);

    /** Todos los eventos, del mas reciente al mas antiguo. */
    @Query("select e from EventoMedico as e order by e.fechaAplicacion desc, e.id desc")
    List<EventoMedico> listarOrdenadosPorFecha();

    /** Cantidad de eventos medicos registrados para una mascota. */
    @Query("select count(e) from EventoMedico as e where e.mascota.id = :idMascota")
    long contarPorMascota(@Param("idMascota") Integer idMascota);

    /**
     * Elimina todos los eventos de una mascota (se usa antes de borrar la
     * mascota, para no violar la llave foranea fk_mascota_evento).
     * Debe ejecutarse dentro de una transaccion (@Transactional en el servicio).
     */
    @Modifying
    @Query("delete from EventoMedico as e where e.mascota.id = :idMascota")
    int eliminarPorMascota(@Param("idMascota") Integer idMascota);
}
