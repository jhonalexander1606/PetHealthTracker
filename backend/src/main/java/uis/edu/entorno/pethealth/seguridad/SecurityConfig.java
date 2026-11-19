package uis.edu.entorno.pethealth.seguridad;

import java.util.Arrays;

import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Configuracion central de Spring Security.
 *
 * Define:
 *   - Que rutas son publicas (login y documentacion Swagger) y cuales requieren
 *     un token JWT valido.
 *   - El control de acceso por rol: el CRUD de usuarios solo lo puede usar ADMIN.
 *   - Sesiones sin estado (STATELESS): no se guardan cookies de sesion, cada
 *     peticion se autentica con su token.
 *   - El codificador de contrasenas BCrypt.
 *   - La politica de CORS para que el frontend pueda consumir la API.
 *   - Las respuestas de error de seguridad: 401 cuando no hay token valido y
 *     403 cuando el token es valido pero el rol no tiene permiso.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
            .authorizeHttpRequests(auth -> auth
                // Rutas publicas: login y documentacion de la API
                .antMatchers("/api/auth/**").permitAll()
                .antMatchers(
                        "/swagger-ui.html",
                        "/swagger-ui/**",
                        "/api-docs/**",
                        "/v3/api-docs/**",
                        "/swagger-resources/**",
                        "/webjars/**"
                ).permitAll()
                // Crear, actualizar y eliminar usuarios: solo el administrador
                .antMatchers(HttpMethod.POST, "/api/usuarios/save").hasRole("ADMIN")
                .antMatchers(HttpMethod.PUT, "/api/usuarios/**").hasRole("ADMIN")
                .antMatchers(HttpMethod.DELETE, "/api/usuarios/**").hasRole("ADMIN")
                // El resto de la API requiere estar autenticado (cualquier rol)
                .anyRequest().authenticated()
            )
            // Respuestas de error de seguridad en JSON.
            // Sin esto, Spring Security responderia 403 en ambos casos y no se
            // podria distinguir "no estoy autenticado" de "no tengo permiso".
            .exceptionHandling()
                // 401 UNAUTHORIZED: no llego token, o el token es invalido/vencido
                .authenticationEntryPoint((peticion, respuesta, excepcion) -> {
                    respuesta.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    respuesta.setContentType("application/json;charset=UTF-8");
                    respuesta.getWriter().write(
                        "{\"Mensaje\":\"No autenticado: falta el token JWT, o es invalido o esta vencido\","
                      + "\"statusCode\":401}");
                })
                // 403 FORBIDDEN: el token es valido, pero el rol no autoriza la operacion
                .accessDeniedHandler((peticion, respuesta, excepcion) -> {
                    respuesta.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    respuesta.setContentType("application/json;charset=UTF-8");
                    respuesta.getWriter().write(
                        "{\"Mensaje\":\"Acceso denegado: su rol no tiene permiso para esta operacion\","
                      + "\"statusCode\":403}");
                })
                .and()
            // Se registra el filtro JWT antes del filtro estandar de usuario/clave
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /** Codificador BCrypt para las contrasenas. */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /** Expone el AuthenticationManager para usarlo en el AuthController. */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    /** Configuracion de CORS: permite que el frontend (file:// o localhost) consuma la API. */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(Arrays.asList("*"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
