package sifeo.tcc.models.dto.response;

import lombok.Data;
import sifeo.tcc.models.enums.CategoriaInsumo;
import sifeo.tcc.models.enums.UnidadeMedida;

@Data
public class InsumoResponseDTO {
    private Integer id;
    private Integer sitioId;
    private String nome;
    private String descricao;
    private Double quantidadeEstoque;
    private String propriedadeNome;
    private CategoriaInsumo categoria;
    private UnidadeMedida unidadeMedida;
    private String fornecedor;
}