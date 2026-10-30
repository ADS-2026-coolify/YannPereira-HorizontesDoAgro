package sifeo.tcc.models.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TipoAtividadeRequestDTO {
    @NotNull(message = "O ID da propriedade (Sítio) é obrigatório")
    private Integer sitioId;
    @NotBlank(message = "O nome do tipo de atividade é obrigatório")
    private String nome;
}