package com.rmp.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${server.port:8080}")
    private int serverPort;

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        
        return new OpenAPI()
            .info(new Info()
                .title("Resource Management Portal API")
                .version("1.0.0")
                .description("""
                    ## Resource Management Portal (RMP) API Documentation
                    
                    This API provides endpoints for managing resources, employees, projects, 
                    skills, allocations, training, certifications, and more.
                    
                    ### Authentication
                    Most endpoints require JWT authentication. Use the `/auth/login` endpoint 
                    to obtain a token, then click "Authorize" and enter: `Bearer <your-token>`
                    
                    ### Available Roles
                    - **ADMIN**: Full access to all resources
                    - **PM (Project Manager)**: Access to projects, allocations, employees
                    - **HR**: Access to employees, skills, training
                    - **EMPLOYEE**: Limited access to own profile and dashboard
                    """)
                .contact(new Contact()
                    .name("Manav Shah")
                    .email("manav.march12@gmail.com")
                    .url("https://github.com/manavshah123"))
                .license(new License()
                    .name("MIT")
                    .url("https://opensource.org/licenses/MIT")))
            .servers(List.of(
                new Server()
                    .url("http://localhost:" + serverPort + "/api")
                    .description("Local Development Server")))
            .addSecurityItem(new SecurityRequirement()
                .addList(securitySchemeName))
            .components(new Components()
                .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                    .name(securitySchemeName)
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("Enter JWT token obtained from /auth/login endpoint")));
    }
}


