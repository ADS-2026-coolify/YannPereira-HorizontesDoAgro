package sifeo.tcc.models.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class DocumentoResponseDTO {
    private Integer id;
    private String nome;
    private String descricao;

    private Integer categoriaId;
    private String categoriaNome;

    private Integer sitioId;
    private String nomePropriedade;

    private String tipoVinculo;
    private Integer vinculoId;
    private String vinculoNome;

    private LocalDate dataAdicionado;
    private boolean receitaDespesa;
    private BigDecimal valor;

    private String nomeArquivo;
    private String tipoArquivo;
    private Integer tamanhoArquivoBytes;
}
