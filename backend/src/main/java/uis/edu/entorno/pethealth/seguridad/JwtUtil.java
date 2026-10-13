package uis.edu.entorno.pethealth.seguridad;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

/**
 * Utilidad para la gestion de JSON Web Tokens (JWT).
 *
 * Se encarga de:
 *   - Generar un token firmado a partir del nombre de usuario y su rol.
 *   - Extraer informacion (claims) de un token existente.
 *   - Validar que un token sea autentico y no haya expirado.
 *
 * El token se firma con el algoritmo HS256 usando la clave secreta definida
 * en application.properties (propiedad jwt.secret).
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    /** Construye la clave de firma a partir del secreto configurado. */
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    /**
     * Genera un token JWT para un usuario, incluyendo su rol e id como claims.
     */
    public String generarToken(String nombreUsuario, String rol, Integer idUsuario) {
        Date ahora = new Date();
        Date vencimiento = new Date(ahora.getTime() + expiration);

        return Jwts.builder()
                .setSubject(nombreUsuario)
                .claim("rol", rol)
                .claim("idUsuario", idUsuario)
                .setIssuedAt(ahora)
                .setExpiration(vencimiento)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /** Extrae el nombre de usuario (subject) del token. */
    public String extraerNombreUsuario(String token) {
        return extraerClaim(token, Claims::getSubject);
    }

    /** Extrae la fecha de expiracion del token. */
    public Date extraerExpiracion(String token) {
        return extraerClaim(token, Claims::getExpiration);
    }

    /** Extrae un claim cualquiera aplicando una funcion sobre el cuerpo del token. */
    public <T> T extraerClaim(String token, Function<Claims, T> resolver) {
        final Claims claims = extraerTodosLosClaims(token);
        return resolver.apply(claims);
    }

    private Claims extraerTodosLosClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /** Indica si el token ya expiro. */
    private boolean estaExpirado(String token) {
        return extraerExpiracion(token).before(new Date());
    }

    /**
     * Valida que el token pertenezca al usuario indicado y que no haya expirado.
     */
    public boolean validarToken(String token, String nombreUsuario) {
        final String usuarioToken = extraerNombreUsuario(token);
        return usuarioToken.equals(nombreUsuario) && !estaExpirado(token);
    }
}
