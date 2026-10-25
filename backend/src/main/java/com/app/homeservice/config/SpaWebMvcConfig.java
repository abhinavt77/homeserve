package com.app.homeservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

@Configuration
public class SpaWebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requestedResource = location.createRelative(resourcePath);
                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            return requestedResource;
                        }
                        // If path is API, WebSocket, or Swagger docs, do not forward to index.html
                        if (resourcePath.startsWith("api") ||
                            resourcePath.startsWith("ws") ||
                            resourcePath.startsWith("v3/api-docs") ||
                            resourcePath.startsWith("swagger-ui")) {
                            return null;
                        }
                        // Forward all client-side routes to index.html
                        return new ClassPathResource("/static/index.html");
                    }
                });
    }
}
