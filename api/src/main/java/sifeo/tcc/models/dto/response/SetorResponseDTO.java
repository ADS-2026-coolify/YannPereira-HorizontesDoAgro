package sifeo.tcc.models.dto.response;

import lombok.Data;
import sifeo.tcc.models.enums.StatusSetor;

import java.time.LocalDate;

@Data
public class SetorResponseDTO {
    private Integer id;
    private String nome;
    private Double hectares;
    private String plantio;
    private StatusSetor status;
    private String nomePropriedade;
    private LocalDate dataEncerramento;
}