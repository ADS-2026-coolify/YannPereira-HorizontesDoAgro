package sifeo.tcc.models.dto.response;

import lombok.Data;
import sifeo.tcc.models.enums.StatusAtividade;

import java.time.LocalDateTime;

@Data
public class AtividadeResponseDTO {
    private Integer id;
    private LocalDateTime dataAtividade;

    private String tipoAtividadeNome;
    private String setorNome;
    private String responsavelNome;
    private String equipamentoNome;

    private Integer setorId;
    private Integer tipoAtividadeId;
    private Integer responsavelId;
    private Integer equipamentoId;

    private StatusAtividade status;
    private String descricao;
}