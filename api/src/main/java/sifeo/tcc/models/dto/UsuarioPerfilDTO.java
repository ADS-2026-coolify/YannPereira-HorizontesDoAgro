package sifeo.tcc.models.dto;

public record UsuarioPerfilDTO(
        Integer id,
        String nomeCompleto,
        String nomeUsuario,
        String email,
        String cpf
) {}