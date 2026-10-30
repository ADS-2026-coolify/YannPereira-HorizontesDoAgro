package sifeo.tcc.models.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import sifeo.tcc.models.enums.CategoriaInsumo;
import sifeo.tcc.models.enums.UnidadeMedida;

@Data
public class InsumoRequestDTO {

    @NotNull(message = "O ID da propriedade (Sítio) é obrigatório")
    private Integer sitioId;

    @NotBlank(message = "O nome do insumo é obrigatório")
    private String nome;

    private String descricao;
    @PositiveOrZero(message = "A quantidade em estoque não pode ser negativa")
    private Double quantidadeEstoque;

    private CategoriaInsumo categoria;
    private UnidadeMedida unidadeMedida;
    private String fornecedor;
}
