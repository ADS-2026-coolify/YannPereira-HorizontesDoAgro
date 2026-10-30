package sifeo.tcc.models.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import sifeo.tcc.models.enums.StatusEquipamento;

import java.time.LocalDate;

@Data
public class EquipamentoRequestDTO {
    @NotNull(message = "O ID da propriedade (Sítio) é obrigatório")
    private Integer sitioId;

    @NotBlank(message = "O nome do equipamento é obrigatório")
    private String nome;

    @NotBlank(message = "O tipo do equipamento é obrigatório")
    private String tipo;

    private String marcaModelo;
    private Integer ano;

    @NotNull(message = "O status é obrigatório")
    private StatusEquipamento status;

    @NotNull(message = "A data de aquisição é obrigatória")
    private LocalDate dataAquisicao;

    private LocalDate dataVenda;
    private String descricao;
}