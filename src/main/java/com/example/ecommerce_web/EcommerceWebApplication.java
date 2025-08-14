package com.example.ecommerce_web;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class EcommerceWebApplication {

	public static void main(String[] args) {
		// In ra tất cả biến môi trường
		System.out.println("=== ENVIRONMENT VARIABLES ===");
		System.getenv().forEach((key, value) -> {
			if (key.toUpperCase().contains("VNPAY")) { // chỉ in biến liên quan VNPay
				System.out.println(key + "=" + value);
			}
		});
		System.out.println("==============================");

		SpringApplication.run(EcommerceWebApplication.class, args);
	}
}


