package sifeo.tcc.security.dto;

public record LoginResponse(String token, String email, String nomeCompleto) {}