package sifeo.tcc.models.dto.response;

import lombok.Data;
import sifeo.tcc.models.enums.StatusEquipamento;

import java.time.LocalDate;

@Data
public class EquipamentoResponseDTO {
    private Integer id;
    private String nome;
    private String tipo;
    private String marcaModelo;
    private Integer ano;
    private StatusEquipamento status;
    private LocalDate dataAquisicao;
    private LocalDate dataVenda;
    private String descricao;
    private String nomePropriedade; 
}
