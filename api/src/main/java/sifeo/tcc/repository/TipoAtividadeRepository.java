package sifeo.tcc.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sifeo.tcc.models.entities.TipoAtividade;
import java.util.List;

@Repository
public interface TipoAtividadeRepository extends JpaRepository<TipoAtividade, Integer> {
    List<TipoAtividade> findBySitioIdOrderByNomeAsc(Integer sitioId);
}