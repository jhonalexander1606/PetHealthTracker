package uis.edu.entorno.pethealth.modelo;

/**
 * DTO (Data Transfer Object) para el login de acceso al sistema.
 *
 * No se mapea con JPA, solo transporta las credenciales (nombreUsuario y
 * password) desde el frontend hacia el microservicio de autenticacion.
 * Sigue el mismo patron del Microservicio Login de Acceso UIS visto en clase.
 */
public class LoginDto {

    private String nombreUsuario;
    private String password;

    // ----- Constructores -----
    public LoginDto() {
    }

    public LoginDto(String nombreUsuario, String password) {
        this.nombreUsuario = nombreUsuario;
        this.password = password;
    }

    // ----- Getters y Setters -----
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
}
