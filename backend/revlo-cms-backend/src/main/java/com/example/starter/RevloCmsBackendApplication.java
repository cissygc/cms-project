package com.example.starter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@EntityScan(basePackages = {"com.example"})
@EnableJpaRepositories(basePackages = {"com.example"})
@ComponentScan(basePackages = {"com.example"})
// PostPublishScheduler'daki @Scheduled metodunun gerçekten çalışması için
// gerekli - bu olmadan @Scheduled hiçbir şey yapmaz, sessizce yoksayılır.
@EnableScheduling
@SpringBootApplication
public class RevloCmsBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(RevloCmsBackendApplication.class, args);
	}

}