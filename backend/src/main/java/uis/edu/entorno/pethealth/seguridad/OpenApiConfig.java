package uis.edu.entorno.pethealth.seguridad;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuracion de la documentacion OpenAPI (Swagger).
 *
 * Sin esta clase, Swagger UI muestra los endpoints pero NO permite enviar el
 * token JWT, por lo que todas las operaciones protegidas responderian 401.
 *
 * Al declarar aqui el esquema de seguridad "bearerAuth":
 *   1. Aparece el boton "Authorize" en la parte superior de Swagger UI.
 *   2. Al pegar alli el token, Swagger lo envia automaticamente en la cabecera
 *      "Authorization: Bearer <token>" de cada peticion.
 */
@Configuration
public class OpenApiConfig {

    private static final String ESQUEMA_JWT = "bearerAuth";

    @Bean
    public OpenAPI petHealthOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("PetHealth Tracker API")
                        .description("Pasaporte Sanitario Digital y Control del Historial "
                                   + "Medico de Mascotas. Entornos de Programacion - UIS 2026-II - Grupo 02. "
                                   + "Para probar los endpoints protegidos: inicie sesion en "
                                   + "POST /api/auth/login, copie el token de la respuesta y peguelo "
                                   + "en el boton Authorize (solo el token, sin escribir la palabra Bearer).")
                        .version("1.0"))
                // Aplica el esquema a todas las operaciones, para que Swagger
                // adjunte el token en cada peticion una vez autorizado.
                .addSecurityItem(new SecurityRequirement().addList(ESQUEMA_JWT))
                .components(new Components()
                        .addSecuritySchemes(ESQUEMA_JWT, new SecurityScheme()
                                .name(ESQUEMA_JWT)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Pegue aqui el token JWT obtenido en /api/auth/login")));
    }
}
