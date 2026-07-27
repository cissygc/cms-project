package com.example.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI revloCmsOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Revlo CMS API")
                        .description(
                                "Headless CMS backend. Admin panel (Decap CMS) ve harici istemciler " +
                                        "(web sitesi, mobil uygulama vb.) bu API üzerinden aynı içeriğe erişir. " +
                                        "Kimlik doğrulama gerektiren uç noktalar için sağ üstteki " +
                                        "'Authorize' butonuna /api/auth/signin'den aldığınız JWT'yi " +
                                        "'Bearer <token>' formatında girin."
                        )
                        .version("v1")
                        .contact(new Contact().name("Revlo CMS")))
                // Tüm uç noktalar için varsayılan olarak bearer auth şeması tanımlı;
                // /api/auth/signin ve /api/public/** gibi zaten açık olan uç noktalarda
                // token gerekmediği için boş bırakılabilir, girilirse de sorun olmaz.
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}
