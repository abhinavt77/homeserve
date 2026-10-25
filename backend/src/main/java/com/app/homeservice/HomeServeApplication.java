package com.app.homeservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HomeServeApplication {

    public static void main(String[] args) {
        SpringApplication.run(HomeServeApplication.class, args);
    }
}
