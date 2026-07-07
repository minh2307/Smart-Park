package com.gateos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GateOsApplication {
    public static void main(String[] args) {
        SpringApplication.run(GateOsApplication.class, args);
    }
}
