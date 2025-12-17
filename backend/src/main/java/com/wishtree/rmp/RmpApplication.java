package com.wishtree.rmp;

import com.wishtree.rmp.config.ZohoConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties(ZohoConfig.class)
public class RmpApplication {

    public static void main(String[] args) {
        SpringApplication.run(RmpApplication.class, args);
    }
}

