package sifeo.tcc.models.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import sifeo.tcc.models.enums.StatusFuncionario;
import java.time.LocalDate;

@Data
public class FuncionarioRequestDTO {

    @NotNull(message = "O ID da propriedade (Sítio) é obrigatório")
    private Integer sitioId;

    @NotBlank(message = "O nome completo do funcionário é obrigatório")
    private String nomeCompleto;

    @Size(max = 14, message = "O CPF deve ter no máximo 11 dígitos")
    private String cpf;

    @Size(max = 15, message = "O telefone deve ter no máximo 15 caracteres")
    private String telefone;

    @Email(message = "Informe um e-mail válido")
    @Size(max = 100, message = "O e-mail deve ter no máximo 100 caracteres")
    private String email;

    private String cargo;
    private LocalDate dataAdmissao;
    private LocalDate dataNascimento;
    private StatusFuncionario status;
}