package sifeo.tcc.models.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import sifeo.tcc.models.enums.StatusEquipamento;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "equipamento")
public class Equipamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sitio_id", nullable = false)
    private Sitio sitio;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false, length = 100)
    private String tipo;

    @Column(name = "marca_modelo", length = 150)
    private String marcaModelo;

    @Column(name = "ano_fabricacao")
    private Integer ano;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private StatusEquipamento status = StatusEquipamento.ATIVO;

    @Column(length = 255)
    private String descricao;

    @Column(name = "data_aquisicao", nullable = false)
    private LocalDate dataAquisicao;

    @Column(name = "data_venda")
    private LocalDate dataVenda;
}