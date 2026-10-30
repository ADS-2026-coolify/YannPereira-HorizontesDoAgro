package sifeo.tcc.models.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class DocumentoRequestDTO {

    @NotNull(message = "O ID da propriedade (Sítio) é obrigatório")
    private Integer sitioId;

    @NotNull(message = "A categoria do documento é obrigatória")
    private Integer categoriaId;

    private String tipoVinculo;

    private Integer vinculoId;

    @NotBlank(message = "O nome do documento é obrigatório")
    private String nome;

    private String descricao;

    @NotNull(message = "A data do documento é obrigatória")
    private LocalDate dataAdicionado;

    private boolean receitaDespesa;

    @NotNull(message = "O valor do documento é obrigatório")
    @PositiveOrZero(message = "O valor não pode ser negativo")
    private BigDecimal valor;

    private String arquivoBase64;

    private String nomeArquivo;

    private String tipoArquivo;
}
