package sifeo.tcc.models.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import sifeo.tcc.models.enums.StatusSetor;

@Data
public class SetorRequestDTO {

    @NotNull(message = "O ID da propriedade (Sítio) é obrigatório")
    private Integer sitioId;

    @NotBlank(message = "O nome do setor é obrigatório")
    private String nome;

    @NotNull(message = "A área em hectares é obrigatória")
    @Positive(message = "A área deve ser maior que zero")
    private Double hectares;

    private String plantio;

    private String observacoes;

    private StatusSetor status;

}