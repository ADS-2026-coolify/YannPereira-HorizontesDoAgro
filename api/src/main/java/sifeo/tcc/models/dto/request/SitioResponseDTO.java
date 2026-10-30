package sifeo.tcc.models.dto.request;

import java.util.List;
import lombok.Data;
import sifeo.tcc.models.dto.response.SetorResponseDTO;

@Data
public class SitioResponseDTO {
    private Integer id;
    private String nome;
    private String cep;
    private String endereco;
    private String municipio;
    private String uf;
    private String cnpj;
    private Integer quantidadeSetores;
    private List<SetorResponseDTO> setores;
}