package sifeo.tcc.models.dto.response;

import lombok.Data;
import sifeo.tcc.models.enums.StatusFuncionario;
import java.time.LocalDate;

@Data
public class FuncionarioResponseDTO {
    private Integer id;
    private String nomeCompleto;
    private String cpf;
    private String telefone;
    private String email;
    private String cargo;
    private LocalDate dataAdmissao;
    private LocalDate dataNascimento;
    private StatusFuncionario status;
    private String propriedadeNome;
}