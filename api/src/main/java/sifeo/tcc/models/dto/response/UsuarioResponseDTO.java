package sifeo.tcc.models.dto.response;

import lombok.Data;
import lombok.Getter;

@Getter
@Data
public class UsuarioResponseDTO {
    private Integer id;
    private String nomeCompleto;
    private String nomeUsuario;
    private String email;
    private String cpf;
}