package com.expensetracker.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {

  @Value("${frontend.url}")
  private String frontendUrl;
  
  @Override
  public void addCorsMappings(@NonNull CorsRegistry registry) {
    registry.addMapping("/**")
      .allowedOrigins(frontendUrl)
      .allowedMethods("GET","POST","PUT","DELETE")
      .allowCredentials(true);
  }
}
