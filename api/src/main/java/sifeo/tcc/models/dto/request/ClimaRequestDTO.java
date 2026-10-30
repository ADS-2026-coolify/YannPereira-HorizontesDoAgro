package sifeo.tcc.models.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import sifeo.tcc.models.enums.Tempo;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ClimaRequestDTO {

    @NotNull(message = "O ID da propriedade (Sítio) é obrigatório")
    private Integer sitioId;

    @NotNull(message = "O tempo (condição climática) é obrigatório")
    private Tempo tempo;

    private String descricao;
    private BigDecimal milimetros;

    @NotNull(message = "A data e hora do registro são obrigatórias")
    private LocalDateTime dataHora;
}
