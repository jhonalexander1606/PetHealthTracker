package uis.edu.entorno.pethealth.modelo;

import java.time.LocalDate;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

/**
 * Entidad que mapea la tabla "eventomedico" en la base de datos.
 *
 * Representa cada evento medico que se le aplica a una mascota: vacuna,
 * desparasitacion, consulta general, cirugia, etc. Cada evento pertenece
 * a una Mascota (relacion @ManyToOne) y puede tener fecha de proxima
 * dosis para los recordatorios de medicina preventiva (HU007).
 */
@Entity
@Table(name = EventoMedico.TABLE_NAME)
public class EventoMedico {

    public static final String TABLE_NAME = "eventomedico";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Relacion con Mascota: muchos eventos -> una mascota
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idMascota", nullable = false)
    private Mascota mascota;

    @Column(name = "tipoEvento", length = 80, nullable = false)
    private String tipoEvento;

    @Column(name = "fechaAplicacion", nullable = false)
    private LocalDate fechaAplicacion;

    @Column(name = "veterinariaClinica", length = 200)
    private String veterinariaClinica;

    @Column(name = "veterinario", length = 150)
    private String veterinario;

    @Column(name = "notasDiagnostico", columnDefinition = "TEXT")
    private String notasDiagnostico;

    @Column(name = "fechaProximaDosis")
    private LocalDate fechaProximaDosis;

    // ----- Constructores -----
    public EventoMedico() {
    }

    public EventoMedico(Integer id, Mascota mascota, String tipoEvento,
                        LocalDate fechaAplicacion, String veterinariaClinica,
                        String veterinario, String notasDiagnostico,
                        LocalDate fechaProximaDosis) {
        this.id = id;
        this.mascota = mascota;
        this.tipoEvento = tipoEvento;
        this.fechaAplicacion = fechaAplicacion;
        this.veterinariaClinica = veterinariaClinica;
        this.veterinario = veterinario;
        this.notasDiagnostico = notasDiagnostico;
        this.fechaProximaDosis = fechaProximaDosis;
    }

    // ----- Getters y Setters -----
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Mascota getMascota() {
        return mascota;
    }

    public void setMascota(Mascota mascota) {
        this.mascota = mascota;
    }

    public String getTipoEvento() {
        return tipoEvento;
    }

    public void setTipoEvento(String tipoEvento) {
        this.tipoEvento = tipoEvento;
    }

    public LocalDate getFechaAplicacion() {
        return fechaAplicacion;
    }

    public void setFechaAplicacion(LocalDate fechaAplicacion) {
        this.fechaAplicacion = fechaAplicacion;
    }

    public String getVeterinariaClinica() {
        return veterinariaClinica;
    }

    public void setVeterinariaClinica(String veterinariaClinica) {
        this.veterinariaClinica = veterinariaClinica;
    }

    public String getVeterinario() {
        return veterinario;
    }

    public void setVeterinario(String veterinario) {
        this.veterinario = veterinario;
    }

    public String getNotasDiagnostico() {
        return notasDiagnostico;
    }

    public void setNotasDiagnostico(String notasDiagnostico) {
        this.notasDiagnostico = notasDiagnostico;
    }

    public LocalDate getFechaProximaDosis() {
        return fechaProximaDosis;
    }

    public void setFechaProximaDosis(LocalDate fechaProximaDosis) {
        this.fechaProximaDosis = fechaProximaDosis;
    }

    @Override
    public String toString() {
        return "EventoMedico [id=" + id + ", tipoEvento=" + tipoEvento
                + ", fechaAplicacion=" + fechaAplicacion
                + ", veterinariaClinica=" + veterinariaClinica
                + ", fechaProximaDosis=" + fechaProximaDosis + "]";
    }
}
