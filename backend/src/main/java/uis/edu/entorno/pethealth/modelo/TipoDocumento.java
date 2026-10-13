package uis.edu.entorno.pethealth.modelo;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * Entidad que mapea la tabla "tipodocumento" en la base de datos.
 *
 * Representa los tipos de documento de identidad soportados por el sistema
 * (CEDULA, TARJETA DE IDENTIDAD, CEDULA DE EXTRANJERIA, PASAPORTE).
 */
@Entity
@Table(name = TipoDocumento.TABLE_NAME)
public class TipoDocumento {

    public static final String TABLE_NAME = "tipodocumento";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "tipo", length = 50, nullable = false)
    private String tipo;

    // ----- Constructores -----
    public TipoDocumento() {
    }

    public TipoDocumento(Integer id, String tipo) {
        this.id = id;
        this.tipo = tipo;
    }

    // ----- Getters y Setters -----
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    @Override
    public String toString() {
        return "TipoDocumento [id=" + id + ", tipo=" + tipo + "]";
    }
}
