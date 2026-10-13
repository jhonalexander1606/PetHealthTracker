package uis.edu.entorno.pethealth.modelo;

import com.fasterxml.jackson.annotation.JsonProperty;

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
 * Entidad que mapea la tabla "usuario" en la base de datos.
 *
 * Representa a los duenos de mascotas y a los administradores del sistema.
 * Un usuario tiene un TipoDocumento asociado (relacion @ManyToOne).
 */
@Entity
@Table(name = Usuario.TABLE_NAME)
public class Usuario {

    public static final String TABLE_NAME = "usuario";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Relacion con TipoDocumento: muchos usuarios -> un tipo de documento
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idTipoDocumento", nullable = false)
    private TipoDocumento tipoDocumento;

    @Column(name = "numeroDocumento", length = 40, nullable = false)
    private String numeroDocumento;

    @Column(name = "nombreCompleto", length = 255, nullable = false)
    private String nombreCompleto;

    @Column(name = "email", length = 255, nullable = false)
    private String email;

    @Column(name = "telefono", length = 20)
    private String telefono;

    @Column(name = "nombreUsuario", length = 100, nullable = false, unique = true)
    private String nombreUsuario;

    // La contrasena se puede recibir al crear/editar (WRITE_ONLY) pero nunca
    // se devuelve en las respuestas JSON (asi no se expone el hash).
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "password", length = 255, nullable = false)
    private String password;

    // Rol del usuario para el control de acceso por JWT: ADMIN, VETERINARIO o DUENO
    @Column(name = "rol", length = 20, nullable = false)
    private String rol = "DUENO";

    // ----- Constructores -----
    public Usuario() {
    }

    public Usuario(Integer id, TipoDocumento tipoDocumento, String numeroDocumento,
                   String nombreCompleto, String email, String telefono,
                   String nombreUsuario, String password) {
        this.id = id;
        this.tipoDocumento = tipoDocumento;
        this.numeroDocumento = numeroDocumento;
        this.nombreCompleto = nombreCompleto;
        this.email = email;
        this.telefono = telefono;
        this.nombreUsuario = nombreUsuario;
        this.password = password;
    }

    // ----- Getters y Setters -----
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public TipoDocumento getTipoDocumento() {
        return tipoDocumento;
    }

    public void setTipoDocumento(TipoDocumento tipoDocumento) {
        this.tipoDocumento = tipoDocumento;
    }

    public String getNumeroDocumento() {
        return numeroDocumento;
    }

    public void setNumeroDocumento(String numeroDocumento) {
        this.numeroDocumento = numeroDocumento;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getNombreUsuario() {
        return nombreUsuario;
    }

    public void setNombreUsuario(String nombreUsuario) {
        this.nombreUsuario = nombreUsuario;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    @Override
    public String toString() {
        return "Usuario [id=" + id + ", numeroDocumento=" + numeroDocumento
                + ", nombreCompleto=" + nombreCompleto + ", email=" + email
                + ", nombreUsuario=" + nombreUsuario + "]";
    }
}
