package sifeo.tcc.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sifeo.tcc.models.entities.HistoricoAtividade;
import java.util.List;

@Repository
public interface HistoricoAtividadeRepository extends JpaRepository<HistoricoAtividade, Integer> {
    List<HistoricoAtividade> findBySitioId(Integer sitioId);

    List<HistoricoAtividade> findBySitio_Usuario_Id(Integer usuarioId);
}