package sifeo.tcc.models.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SitioRequestDTO {

    @NotBlank(message = "O nome da propriedade é obrigatório")
    private String nome;

    private String cep;
    private String endereco;

    @NotBlank(message = "O município é obrigatório")
    private String municipio;

    @NotBlank(message = "A UF é obrigatória")
    @Size(min = 2, max = 2, message = "A UF deve ter 2 letras")
    private String uf;

    private String cnpj;
}
