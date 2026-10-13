package uis.edu.entorno.pethealth.repositorio;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import uis.edu.entorno.pethealth.modelo.TipoDocumento;

/**
 * Repositorio JPA para la entidad TipoDocumento.
 * Hereda las operaciones CRUD basicas de JpaRepository.
 */
@Repository
public interface TipoDocumentoRepositorio extends JpaRepository<TipoDocumento, Integer> {
}
