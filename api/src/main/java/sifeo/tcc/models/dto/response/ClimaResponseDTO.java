package sifeo.tcc.models.dto.response;

import lombok.Data;
import sifeo.tcc.models.enums.Tempo;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ClimaResponseDTO {
    private Integer id;
    private String propriedadeNome;

    private Tempo tempo;
    private String descricao;
    private BigDecimal milimetros;
    private LocalDateTime dataHora;
}