package uis.edu.entorno.pethealth.modelo;

/**
 * DTO de respuesta del login con JWT.
 *
 * Se devuelve al frontend cuando la autenticacion es correcta e incluye el
 * token y los datos basicos del usuario para mostrarlos y controlar el acceso
 * por rol en la interfaz.
 */
public class AuthResponse {

    private String token;
    private String tipo = "Bearer";
    private Integer idUsuario;
    private String nombreUsuario;
    private String nombreCompleto;
    private String rol;

    public AuthResponse() {
    }

    public AuthResponse(String token, Integer idUsuario, String nombreUsuario,
                        String nombreCompleto, String rol) {
        this.token = token;
        this.idUsuario = idUsuario;
        this.nombreUsuario = nombreUsuario;
        this.nombreCompleto = nombreCompleto;
        this.rol = rol;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public Integer getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getNombreUsuario() {
        return nombreUsuario;
    }

    public void setNombreUsuario(String nombreUsuario) {
        this.nombreUsuario = nombreUsuario;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }
}
