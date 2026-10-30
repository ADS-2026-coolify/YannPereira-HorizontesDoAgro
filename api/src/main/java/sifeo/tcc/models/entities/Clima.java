package sifeo.tcc.models.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import sifeo.tcc.models.enums.Tempo;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "clima")
public class Clima {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sitio_id", nullable = false)
    private Sitio sitio;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Tempo tempo;

    private String descricao;

    @Column(precision = 10, scale = 2)
    private BigDecimal milimetros;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;
}

