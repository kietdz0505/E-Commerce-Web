package com.example.ecommerce_web.controller;

import org.springframework.web.bind.annotation.GetMapping;

public class HomeController {
    @GetMapping("/")
    public String hello() {
        return "Backend is running!";
    }
}
