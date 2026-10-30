package sifeo.tcc.models.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import sifeo.tcc.models.enums.CategoriaInsumo;
import sifeo.tcc.models.enums.UnidadeMedida;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "insumo")
public class Insumo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sitio_id", nullable = false)
    private Sitio sitio;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(length = 255)
    private String descricao;

    @Column(name = "quantidade_estoque", nullable = false)
    private Double quantidadeEstoque;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private CategoriaInsumo categoria;

    @Enumerated(EnumType.STRING)
    @Column(name = "unidade_medida", length = 30)
    private UnidadeMedida unidadeMedida;

    @Column(length = 150)
    private String fornecedor;
}