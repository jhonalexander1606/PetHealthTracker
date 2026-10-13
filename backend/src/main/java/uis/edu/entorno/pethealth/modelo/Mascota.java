package uis.edu.entorno.pethealth.modelo;

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
 * Entidad que mapea la tabla "mascota" en la base de datos.
 *
 * Representa la ficha sanitaria de cada mascota (perro, gato u otra especie).
 * Cada mascota pertenece a un Usuario dueno (relacion @ManyToOne).
 */
@Entity
@Table(name = Mascota.TABLE_NAME)
public class Mascota {

    public static final String TABLE_NAME = "mascota";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Relacion con Usuario (dueno): muchas mascotas -> un usuario
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idUsuario", nullable = false)
    private Usuario usuario;

    @Column(name = "nombre", length = 100, nullable = false)
    private String nombre;

    @Column(name = "especie", length = 50, nullable = false)
    private String especie;

    @Column(name = "raza", length = 100)
    private String raza;

    @Column(name = "edad", nullable = false)
    private Integer edad;

    @Column(name = "sexo", length = 20)
    private String sexo;

    @Column(name = "peso")
    private Double peso;

    @Column(name = "color", length = 50)
    private String color;

    // ----- Constructores -----
    public Mascota() {
    }

    public Mascota(Integer id, Usuario usuario, String nombre, String especie,
                   String raza, Integer edad, String sexo, Double peso, String color) {
        this.id = id;
        this.usuario = usuario;
        this.nombre = nombre;
        this.especie = especie;
        this.raza = raza;
        this.edad = edad;
        this.sexo = sexo;
        this.peso = peso;
        this.color = color;
    }

    // ----- Getters y Setters -----
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getEspecie() {
        return especie;
    }

    public void setEspecie(String especie) {
        this.especie = especie;
    }

    public String getRaza() {
        return raza;
    }

    public void setRaza(String raza) {
        this.raza = raza;
    }

    public Integer getEdad() {
        return edad;
    }

    public void setEdad(Integer edad) {
        this.edad = edad;
    }

    public String getSexo() {
        return sexo;
    }

    public void setSexo(String sexo) {
        this.sexo = sexo;
    }

    public Double getPeso() {
        return peso;
    }

    public void setPeso(Double peso) {
        this.peso = peso;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    @Override
    public String toString() {
        return "Mascota [id=" + id + ", nombre=" + nombre + ", especie=" + especie
                + ", raza=" + raza + ", edad=" + edad + "]";
    }
}
